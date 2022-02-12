import React, { JSXElementConstructor } from 'react';
import createStyledComponent from '../models/StyledComponent';
import { WebTarget } from '../types';
import domElements from '../utils/domElements';
import constructWithOptions, { Construct } from './constructWithOptions';

const baseStyled = <Target extends WebTarget>(tag: Target) =>
  constructWithOptions<
    Target,
    Target extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>
      ? React.ComponentProps<Target>
      : undefined
  >(createStyledComponent, tag);

const enhancedStyled = baseStyled as typeof baseStyled & {
  [E in keyof JSX.IntrinsicElements]: ReturnType<
    <Props extends {} = {}>() => ReturnType<Construct<E, React.ComponentProps<E> & Props>>
  >;
};

// Shorthands for all valid HTML Elements
domElements.forEach(domElement => {
  enhancedStyled[domElement] = baseStyled(domElement);
});

export default enhancedStyled;
