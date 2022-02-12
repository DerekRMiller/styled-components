import {
  Attrs,
  Interpolation,
  IStyledComponent,
  IStyledComponentFactory,
  RuleSet,
  StyledObject,
  StyledOptions,
  StyledTarget,
  StyleFunction,
} from '../types';
import { EMPTY_OBJECT } from '../utils/empties';
import styledError from '../utils/error';
import css from './css';

export interface Styled<Target extends StyledTarget, OuterProps = {}> {
  <Props = OuterProps>(
    initialStyles: TemplateStringsArray | StyledObject | StyleFunction<OuterProps & Props>,
    ...interpolations: Interpolation<OuterProps & Props>[]
  ): IStyledComponent<Target, OuterProps & Props>;
  attrs<Props = OuterProps>(attrs: Attrs<OuterProps & Props>): Styled<Target, OuterProps>;
}
export interface Construct<
  Target extends StyledTarget,
  OuterProps = {} // used for styled<{}>().attrs() so attrs() gets the generic prop context
> {
  <Props = OuterProps>(
    componentConstructor: IStyledComponentFactory<Target, OuterProps & Props>,
    tag: Target,
    options?: StyledOptions<OuterProps & Props>
  ): Styled<Target, OuterProps & Props>;
  attrs<Props = OuterProps>(attrs: Attrs<Props>): Construct<Target, OuterProps & Props>;
  withConfig<Props = OuterProps>(
    config: StyledOptions<OuterProps & Props>
  ): Construct<Target, OuterProps & Props>;
}

export default function constructWithOptions<
  Target extends StyledTarget,
  OuterProps = {} // used for styled<{}>().attrs() so attrs() gets the generic prop context
>(
  componentConstructor: IStyledComponentFactory<Target, OuterProps>,
  tag: Target,
  options: StyledOptions<OuterProps> = EMPTY_OBJECT as Object
) {
  // We trust that the tag is a valid component as long as it isn't falsish
  // Typically the tag here is a string or function (i.e. class or pure function component)
  // However a component may also be an object if it uses another utility, e.g. React.memo
  // React will output an appropriate warning however if the `tag` isn't valid
  if (!tag) {
    throw styledError(1, tag);
  }

  /* This is callable directly as a template function */
  const templateFunction = <Props = OuterProps>(
    initialStyles: TemplateStringsArray | StyledObject | StyleFunction<OuterProps & Props>,
    ...interpolations: Interpolation<Props>[]
  ) => componentConstructor(tag, options, css(initialStyles, ...interpolations) as RuleSet<Props>);

  /* Modify/inject new props at runtime */
  templateFunction.attrs = <Props = OuterProps>(attrs: Attrs<Props>) =>
    constructWithOptions<Target, OuterProps & Props>(
      componentConstructor as IStyledComponentFactory<Target, OuterProps & Props>,
      tag,
      {
        ...options,
        attrs: Array.prototype.concat(options.attrs, attrs).filter(Boolean),
      }
    );

  /**
   * If config methods are called, wrap up a new template function and merge options */
  templateFunction.withConfig = <Props = OuterProps>(config: StyledOptions<OuterProps & Props>) =>
    constructWithOptions<Target, OuterProps & Props>(
      componentConstructor as IStyledComponentFactory<Target, OuterProps & Props>,
      tag,
      {
        ...options,
        ...config,
      }
    );

  return templateFunction;
}
