import React, { ComponentType } from 'react';
import constructWithOptions from './constructors/constructWithOptions';
import ComponentStyle from './models/ComponentStyle';
import { DefaultTheme } from './models/ThemeProvider';
import createWarnTooManyClasses from './utils/createWarnTooManyClasses';

export type StyledOptions<Props> = {
  attrs?: Attrs<Props>[];
  componentId?: string;
  displayName?: string;
  parentComponentId?: string;
  shouldForwardProp?: ShouldForwardProp;
};

export type BaseExtensibleObject = {
  [key: string]: any;
};

export type ExtensibleObject = BaseExtensibleObject & {
  theme?: DefaultTheme;
};

export type ExecutionContext = BaseExtensibleObject & {
  theme: DefaultTheme;
};

export type StyleFunction<Props> = (
  executionContext: ExecutionContext & Props
) => Interpolation<Props>;

// Do not add IStyledComponent to this union, it breaks prop function interpolation in TS
export type Interpolation<Props = undefined> =
  | StyleFunction<Props & ExecutionContext>
  | ExtensibleObject
  | string
  | Keyframes
  | Interpolation<Props & ExecutionContext>[];

export type Attrs<Props = ExecutionContext> =
  | ExtensibleObject
  | ((props: ExecutionContext & Props) => ExecutionContext);

export type RuleSet<Props extends {} = {}> = Interpolation<Props>[];

export type Styles = string[] | Object | ((executionContext: ExecutionContext) => Interpolation);

export type KnownWebTarget =
  | keyof JSX.IntrinsicElements
  | React.ComponentType<any>
  | React.ForwardRefExoticComponent<any>;
export type WebTarget =
  | string // allow custom elements, etc.
  | KnownWebTarget;

export type NativeTarget = ComponentType<any> | React.ForwardRefExoticComponent<any>;

export type NameGenerator = (hash: number) => string;

export type CSSConstructor = (strings: string[], ...interpolations: Interpolation[]) => RuleSet;
export type StyleSheet = {
  create: Function;
};

export interface Keyframes {
  id: string;
  name: string;
  rules: string;
}

export type Flattener = (
  chunks: Interpolation[],
  executionContext: Object | null | undefined,
  styleSheet: Object | null | undefined
) => Interpolation[];

export type FlattenerResult = RuleSet | string | string[] | IStyledComponent<any> | Keyframes;

export interface Stringifier {
  (css: string, selector?: string, prefix?: string, componentId?: string): string;
  hash: string;
}

export type ShouldForwardProp = (
  prop: string,
  isValidAttr: (prop: string) => boolean,
  elementToBeCreated?: WebTarget | NativeTarget
) => boolean;

export interface CommonStatics<Props> {
  attrs: Attrs<Props>[];
  target: StyledTarget;
  shouldForwardProp?: ShouldForwardProp;
  withComponent: any;
}

export interface IStyledStatics<Props> extends CommonStatics<Props> {
  componentStyle: ComponentStyle;
  // this is here because we want the uppermost displayName retained in a folding scenario
  foldedComponentIds: Array<string>;
  target: WebTarget;
  styledComponentId: string;
  warnTooManyClasses?: ReturnType<typeof createWarnTooManyClasses>;
  withComponent: (tag: WebTarget) => IStyledComponent<WebTarget>;
}

type CustomComponentProps<
  ActualComponent extends WebTarget,
  PropsToBeInjectedIntoActualComponent extends object,
  ActualComponentProps = ActualComponent extends KnownWebTarget
    ? React.ComponentProps<ActualComponent>
    : {}
> = Omit<PropsToBeInjectedIntoActualComponent, keyof ActualComponentProps | 'as' | '$as'> &
  ActualComponentProps & {
    $as?: ActualComponent;
    as?: ActualComponent;
  };

interface CustomComponent<
  FallbackComponent extends WebTarget,
  ExpectedProps extends {} = {},
  PropsToBeInjectedIntoActualComponent extends {} = {}
> extends React.ForwardRefExoticComponent<ExpectedProps> {
  <ActualComponent extends WebTarget = FallbackComponent>(
    props: CustomComponentProps<ActualComponent, ExpectedProps>
  ): React.ReactElement<
    CustomComponentProps<
      ActualComponent,
      ExecutionContext & ExpectedProps & PropsToBeInjectedIntoActualComponent
    >,
    WebTarget
  >;
}

export interface IStyledComponent<Target extends WebTarget, Props extends {} = {}>
  extends CustomComponent<Target, Props>,
    IStyledStatics<Props> {
  defaultProps?: Partial<Props>;
  toString: () => string;
}

export type IStyledComponentFactory<Target extends WebTarget, Props extends {} = {}> = (
  target: Target,
  options: StyledOptions<Props>,
  rules: RuleSet<Props>
) => IStyledComponent<Target, Props>;

export interface IStyledNativeStatics<Target extends NativeTarget, Props extends {} = {}>
  extends CommonStatics<Props> {
  inlineStyle: InstanceType<IInlineStyleConstructor>;
  target: NativeTarget;
  withComponent: (tag: NativeTarget) => IStyledNativeComponent<Target, Props>;
}

export interface IStyledNativeComponent<Target extends NativeTarget, Props extends {} = {}>
  extends CustomComponent<Target, Props>,
    IStyledNativeStatics<Target, Props> {
  defaultProps?: Partial<Props>;
}

export type IStyledNativeComponentFactory<Target extends NativeTarget, Props extends {} = {}> = (
  target: IStyledNativeComponent<Target>['target'],
  options: {
    attrs?: Attrs<Props>[];
    displayName?: string;
    shouldForwardProp?: ShouldForwardProp;
  },
  rules: RuleSet
) => IStyledNativeComponent<Target>;
export interface IInlineStyleConstructor {
  new (rules: RuleSet): IInlineStyle;
}

export interface IInlineStyle {
  rules: RuleSet;
  generateStyleObject(executionContext: Object): Object;
}

export type StyledTarget = WebTarget | NativeTarget;

export type StyledTemplateFunction = ReturnType<typeof constructWithOptions>;

type StyledElementShortcuts = {
  [key in keyof JSX.IntrinsicElements]?: StyledTemplateFunction;
};

export interface Styled extends StyledElementShortcuts {
  (tag: WebTarget): StyledTemplateFunction;
}

type CSSValue = string | number;

export type StyledObject = {
  [key: string]: StyledObject | CSSValue | ((...any: any[]) => CSSValue);
} & {
  // uncomment when we can eventually override index signatures with more specific types
  // [K in keyof CSS.Properties]: CSS.Properties[K] | ((...any: any[]) => CSS.Properties[K]);
};
