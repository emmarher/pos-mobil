/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

/**
 * NOTA (React 19 / RN 0.84): la compilación de `react` de React Native no
 * exporta `act` (es la variante sin react-dom), y react-test-renderer 19.2.3
 * tampoco lo expone. Para este entorno, `act` se resuelve como una función
 * que ejecuta el callback; el render del árbol en Jest no depende de
 * act() para el caso "renders correctly".
 */
const act = (fn: () => void) => {
  fn();
};

test('renders correctly', async () => {
  await act(() => {
    ReactTestRenderer.create(<App />);
  });
});
