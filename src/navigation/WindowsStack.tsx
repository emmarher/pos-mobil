/**
 * navigation/WindowsStack.tsx — Stack navigator JS puro para Windows.
 *
 * ────────────────────────────────────────────────────────────────────────
 * RNW 0.84 es solo New Architecture (Fabric). react-native-screens y
 * react-native-device-info traen módulos nativos Old Architecture (UWP/
 * WinUI2) que no compilan contra WinUI3, por lo que se excluyeron del
 * build de Windows (react-native.config.js + sln).
 *
 * @react-navigation/native-stack no tiene fallback JS: su NativeStackView
 * renderiza <ScreenStack> (componente nativo de react-native-screens),
 * que no existe sin el módulo nativo. Este módulo ofrece un stack
 * navigator 100% JS (useNavigationBuilder + StackRouter) con la misma
 * API de navegación usada por las pantallas de la app (navigate,
 * replace, goBack, route.params) para que la app arranque en Windows.
 * ────────────────────────────────────────────────────────────────────────
 */
import * as React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  createNavigatorFactory,
  StackRouter,
  useNavigationBuilder,
  type DefaultNavigatorOptions,
  type NavigationProp,
  type ParamListBase,
  type StackNavigationState,
  type StaticConfig,
  type TypedNavigator,
} from '@react-navigation/native';

type WindowsStackNavigationOptions = {headerShown?: boolean};

type WindowsStackNavigationEventMap = {};

type WindowsStackNavigationProp<ParamList extends ParamListBase, RouteName extends keyof ParamList> =
  NavigationProp<ParamList, RouteName>;

type WindowsStackTypeBag<
  ParamList extends ParamListBase = ParamListBase,
  NavigatorID extends string | undefined = string | undefined,
> = {
  ParamList: ParamList;
  NavigatorID: NavigatorID;
  State: StackNavigationState<ParamList>;
  ScreenOptions: WindowsStackNavigationOptions;
  EventMap: WindowsStackNavigationEventMap;
  NavigationList: {
    [RouteName in keyof ParamList]: WindowsStackNavigationProp<ParamList, RouteName>;
  };
  Navigator: typeof WindowsStackNavigator;
};

type WindowsStackNavigatorProps = DefaultNavigatorOptions<
  ParamListBase,
  string | undefined,
  StackNavigationState<ParamListBase>,
  WindowsStackNavigationOptions,
  WindowsStackNavigationEventMap,
  NavigationProp<ParamListBase>
>;

function WindowsStackNavigator({
  id,
  initialRouteName,
  children,
  screenOptions,
  ...rest
}: WindowsStackNavigatorProps) {
  const {state, descriptors, NavigationContent} = useNavigationBuilder(StackRouter, {
    id,
    initialRouteName,
    children,
    screenOptions,
  });

  const focusedKey = state.routes[state.index]?.key;

  return (
    <NavigationContent>
      <View style={styles.container} {...rest}>
        {state.routes.map(route => {
          const descriptor = descriptors[route.key];
          if (descriptor == null) {
            return null;
          }
          return (
            <View
              key={route.key}
              style={route.key === focusedKey ? styles.focused : styles.hidden}
              pointerEvents={route.key === focusedKey ? 'auto' : 'none'}
            >
              {descriptor.render()}
            </View>
          );
        })}
      </View>
    </NavigationContent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  focused: {
    ...StyleSheet.absoluteFillObject,
  },
  hidden: {
    display: 'none',
  },
});

export function createWindowsStackNavigator<
  const ParamList extends ParamListBase,
  const NavigatorID extends string | undefined = string | undefined,
  const TypeBag extends WindowsStackTypeBag<ParamList, NavigatorID> = WindowsStackTypeBag<ParamList, NavigatorID>,
  const Config extends StaticConfig<TypeBag> = StaticConfig<TypeBag>,
>(config?: Config): TypedNavigator<TypeBag, Config> {
  return createNavigatorFactory(WindowsStackNavigator)(config) as TypedNavigator<TypeBag, Config>;
}

export default createWindowsStackNavigator;