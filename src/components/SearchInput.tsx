/**
 * components/SearchInput.tsx — Campo de búsqueda glass (spec 3.5).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Input 48px con icono de lupa, glass, placeholder como ejemplo de formato.
 * El placeholder nunca sustituye a la etiqueta (interaction: labels visibles).
 * ────────────────────────────────────────────────────────────────────────
 */
import React from 'react';
import {StyleSheet, Text, TextInput, View, ViewStyle} from 'react-native';
import {useTheme} from '../hooks/useTheme';

interface SearchInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: ViewStyle;
  testID?: string;
  /** Ref al TextInput interno (para atajos de teclado en escritorio). */
  inputRef?: React.RefObject<TextInput | null>;
}

export default function SearchInput({
  placeholder,
  value,
  onChangeText,
  style,
  testID,
  inputRef,
}: SearchInputProps) {
  const {colors, fonts, radius} = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.input,
          borderColor: colors.border,
          borderRadius: radius.md,
        },
        style,
      ]}>
      <Text style={[styles.icon, {color: colors.textSecondary}]}>🔍</Text>
      <TextInput
        ref={inputRef}
        testID={testID}
        style={[styles.input, {color: colors.text, fontSize: fonts.regular}]}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Text
          style={[styles.clear, {color: colors.textSecondary}]}
          onPress={() => onChangeText('')}>
          ✕
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  icon: {fontSize: 16, marginRight: 8},
  input: {flex: 1, fontWeight: '500'},
  clear: {fontSize: 14, padding: 4, fontWeight: '700'},
});
