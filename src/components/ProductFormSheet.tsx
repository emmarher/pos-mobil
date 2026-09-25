/**
 * components/ProductFormSheet.tsx — Formulario de nuevo producto (RF-CA-002).
 *
 * ────────────────────────────────────────────────────────────────────────
 * Hoja inferior glass que crea un producto vía POST /products:
 *   - Nombre (requerido), categoría, unidad base/venta (requeridas).
 *   - Precio, costo, stock inicial, stock mínimo.
 *   - Precios por tipo (Público/Mayoreo/Especial) con prefill sugerido.
 *   - Flags: báscula (solo si la unidad de venta es MASS), fraccional.
 * Requiere permiso products:create (el padre solo lo muestra si lo tiene).
 * ────────────────────────────────────────────────────────────────────────
 */
import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {useTheme} from '../hooks/useTheme';
import {Category, MeasurementUnit, PriceType} from '../models';
import {
  createProduct,
  getCategories,
  getMeasurementUnits,
  getPriceTypes,
} from '../api/endpoints';
import {ApiError} from '../api/client';
import POSButton from './POSButton';
import DesktopDialog from './DesktopDialog';

interface ProductFormSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Recarga el inventario tras crear (padre). */
  onCreated: () => void;
}

export default function ProductFormSheet({
  visible,
  onClose,
  onCreated,
}: ProductFormSheetProps) {
  const {colors, fonts, spacing, radius} = useTheme();

  // Datos de los selects
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<MeasurementUnit[]>([]);
  const [priceTypes, setPriceTypes] = useState<PriceType[]>([]);

  // Campos del formulario
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [baseUnitId, setBaseUnitId] = useState<string | null>(null);
  const [saleUnitId, setSaleUnitId] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [pricesByType, setPricesByType] = useState<Record<string, string>>({});
  const [isScale, setIsScale] = useState(false);
  const [allowFractional, setAllowFractional] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* Cargar catálogos al abrir */
  const loadOptions = useCallback(async () => {
    const [cats, us, pts] = await Promise.all([
      getCategories().catch(() => []),
      getMeasurementUnits().catch(() => []),
      getPriceTypes().catch(() => []),
    ]);
    setCategories(cats);
    setUnits(us);
    setPriceTypes(pts);
    // Defaults: primera categoría y unidad "pieza" si existe
    if (cats.length > 0) setCategoryId(cats[0].id);
    const piece = us.find(u => u.code === 'piece') ?? us[0];
    if (piece) {
      setBaseUnitId(piece.id);
      setSaleUnitId(piece.id);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      void loadOptions();
    }
  }, [visible, loadOptions]);

  /* Prefill de precios por tipo cuando se escribe el precio base */
  const handlePriceChange = (value: string) => {
    setPrice(value);
    const num = parseFloat(value);
    if (!Number.isFinite(num) || num <= 0) return;
    const next: Record<string, string> = {};
    for (const pt of priceTypes) {
      if (pt.code === 'RETAIL') next[pt.id] = value;
      else if (pt.code === 'WHOLESALE') next[pt.id] = (num * 0.9).toFixed(2);
      else if (pt.code === 'SPECIAL') next[pt.id] = (num * 1.15).toFixed(2);
    }
    setPricesByType(prev => ({...next, ...prev}));
  };

  /* Validación + envío */
  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Datos incompletos', 'El nombre es obligatorio.');
      return;
    }
    if (!baseUnitId || !saleUnitId) {
      Alert.alert('Datos incompletos', 'Selecciona las unidades base y de venta.');
      return;
    }
    const num = (s: string) => {
      const v = parseFloat(s);
      return Number.isFinite(v) ? v : undefined;
    };

    // Precios por tipo: solo los que tengan valor > 0
    const prices = priceTypes
      .filter(pt => {
        const v = parseFloat(pricesByType[pt.id] ?? '');
        return Number.isFinite(v) && v > 0;
      })
      .map(pt => ({
        price_type_id: pt.id,
        price: parseFloat(pricesByType[pt.id]!),
        min_quantity: pt.code === 'WHOLESALE' ? 10 : 1,
      }));

    setSubmitting(true);
    try {
      await createProduct({
        name: name.trim(),
        category_id: categoryId,
        base_unit_id: baseUnitId,
        sale_unit_id: saleUnitId,
        price: num(price),
        cost: num(cost),
        min_stock: num(minStock),
        is_scale_enabled: isScale,
        allow_fractional_sale: allowFractional,
        prices: prices.length > 0 ? prices : undefined,
      });
      // Stock inicial: el POST crea con stock 0; se ajusta luego con el
      // flujo de inventario (RF-IN-005). Por ahora se informa al usuario.
      onCreated();
      onClose();
      setName('');
      setPrice('');
      setCost('');
      setStock('');
      setMinStock('');
      setPricesByType({});
      Alert.alert('Producto creado', 'El producto se agregó al catálogo.');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudo crear el producto.';
      Alert.alert('Error al crear', message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSaleUnit = units.find(u => u.id === saleUnitId);

  // Cuerpo compartido entre la hoja móvil y el diálogo de escritorio
  const body = (
    <>
      <Text style={[styles.title, {color: colors.text, fontSize: fonts.medium}]}>
        Nuevo producto
      </Text>

      <ScrollView contentContainerStyle={{paddingBottom: 16}}>
            {/* Nombre */}
            <Text style={[styles.label, {color: colors.textSecondary, fontSize: fonts.small}]}>
              Nombre *
            </Text>
            <TextInput
              style={[styles.input, {backgroundColor: colors.input, borderColor: colors.border, color: colors.text, fontSize: fonts.regular, borderRadius: radius.md}]}
              placeholder="Ej. Arroz 1kg"
              placeholderTextColor={colors.textDisabled}
              value={name}
              onChangeText={setName}
              testID="pf-name"
            />

            {/* Categoría */}
            <Text style={[styles.label, {color: colors.textSecondary, fontSize: fonts.small}]}>
              Categoría
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {categories.map(c => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setCategoryId(c.id)}
                  style={[
                    styles.chip,
                    {
                      borderRadius: radius.round,
                      backgroundColor: categoryId === c.id ? colors.primary : colors.surface,
                      borderColor: categoryId === c.id ? colors.primary : colors.border,
                    },
                  ]}
                  testID={`pf-cat-${c.id}`}>
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: categoryId === c.id ? colors.onPrimary : colors.textSecondary,
                        fontSize: fonts.small,
                      },
                    ]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Unidades */}
            <Text style={[styles.label, {color: colors.textSecondary, fontSize: fonts.small}]}>
              Unidad base / venta *
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {units.map(u => (
                <TouchableOpacity
                  key={u.id}
                  onPress={() => {
                    setBaseUnitId(u.id);
                    setSaleUnitId(u.id);
                  }}
                  style={[
                    styles.chip,
                    {
                      borderRadius: radius.round,
                      backgroundColor: baseUnitId === u.id ? colors.primary : colors.surface,
                      borderColor: baseUnitId === u.id ? colors.primary : colors.border,
                    },
                  ]}
                  testID={`pf-unit-${u.code}`}>
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: baseUnitId === u.id ? colors.onPrimary : colors.textSecondary,
                        fontSize: fonts.small,
                      },
                    ]}>
                    {u.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Precio / costo */}
            <View style={styles.row2}>
              <View style={styles.flex}>
                <Text style={[styles.label, {color: colors.textSecondary, fontSize: fonts.small}]}>
                  Precio (Público)
                </Text>
                <TextInput
                  style={[styles.input, {backgroundColor: colors.input, borderColor: colors.border, color: colors.text, fontSize: fonts.regular, borderRadius: radius.md}]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textDisabled}
                  value={price}
                  onChangeText={handlePriceChange}
                  keyboardType="decimal-pad"
                  testID="pf-price"
                />
              </View>
              <View style={styles.flex}>
                <Text style={[styles.label, {color: colors.textSecondary, fontSize: fonts.small}]}>
                  Costo
                </Text>
                <TextInput
                  style={[styles.input, {backgroundColor: colors.input, borderColor: colors.border, color: colors.text, fontSize: fonts.regular, borderRadius: radius.md}]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textDisabled}
                  value={cost}
                  onChangeText={setCost}
                  keyboardType="decimal-pad"
                  testID="pf-cost"
                />
              </View>
            </View>

            {/* Stock */}
            <View style={styles.row2}>
              <View style={styles.flex}>
                <Text style={[styles.label, {color: colors.textSecondary, fontSize: fonts.small}]}>
                  Stock inicial
                </Text>
                <TextInput
                  style={[styles.input, {backgroundColor: colors.input, borderColor: colors.border, color: colors.text, fontSize: fonts.regular, borderRadius: radius.md}]}
                  placeholder="0"
                  placeholderTextColor={colors.textDisabled}
                  value={stock}
                  onChangeText={setStock}
                  keyboardType="number-pad"
                  testID="pf-stock"
                />
              </View>
              <View style={styles.flex}>
                <Text style={[styles.label, {color: colors.textSecondary, fontSize: fonts.small}]}>
                  Stock mínimo
                </Text>
                <TextInput
                  style={[styles.input, {backgroundColor: colors.input, borderColor: colors.border, color: colors.text, fontSize: fonts.regular, borderRadius: radius.md}]}
                  placeholder="0"
                  placeholderTextColor={colors.textDisabled}
                  value={minStock}
                  onChangeText={setMinStock}
                  keyboardType="number-pad"
                  testID="pf-minstock"
                />
              </View>
            </View>

            {/* Precios por tipo */}
            {priceTypes.length > 1 && (
              <>
                <Text style={[styles.label, {color: colors.textSecondary, fontSize: fonts.small}]}>
                  Precios por tipo
                </Text>
                {priceTypes.map(pt => (
                  <View key={pt.id} style={styles.row2}>
                    <View style={styles.flex}>
                      <Text style={[styles.subLabel, {color: colors.textSecondary, fontSize: fonts.micro}]}>
                        {pt.name}
                      </Text>
                      <TextInput
                        style={[styles.input, {backgroundColor: colors.input, borderColor: colors.border, color: colors.text, fontSize: fonts.regular, borderRadius: radius.md}]}
                        placeholder={pt.code === 'WHOLESALE' ? 'x0.9' : pt.code === 'SPECIAL' ? 'x1.15' : '0.00'}
                        placeholderTextColor={colors.textDisabled}
                        value={pricesByType[pt.id] ?? ''}
                        onChangeText={v => setPricesByType(prev => ({...prev, [pt.id]: v}))}
                        keyboardType="decimal-pad"
                        testID={`pf-price-${pt.code}`}
                      />
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* Flags */}
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, {color: colors.text, fontSize: fonts.regular}]}>
                Usa báscula
              </Text>
              <Switch
                value={isScale}
                onValueChange={setIsScale}
                disabled={selectedSaleUnit?.unit_type !== 'MASS'}
                trackColor={{true: colors.primary}}
                testID="pf-scale"
              />
            </View>
            <Text style={[styles.hint, {color: colors.textSecondary, fontSize: fonts.micro}]}>
              {selectedSaleUnit?.unit_type === 'MASS'
                ? 'La unidad de venta es MASS: se puede habilitar báscula.'
                : 'Báscula solo disponible si la unidad de venta es MASS.'}
            </Text>
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, {color: colors.text, fontSize: fonts.regular}]}>
                Venta fraccional
              </Text>
              <Switch
                value={allowFractional}
                onValueChange={setAllowFractional}
                trackColor={{true: colors.primary}}
                testID="pf-fractional"
              />
            </View>

            {/* Acciones */}
            <POSButton
              title={submitting ? 'Creando…' : 'Crear producto'}
              onPress={handleSubmit}
              loading={submitting}
              large
              style={{marginTop: spacing.md}}
              testID="pf-submit"
            />
            <POSButton
              title="Cancelar"
              onPress={onClose}
              variant="ghost"
              style={{marginTop: spacing.sm}}
              testID="pf-cancel"
            />
        </ScrollView>
    </>
  );

  // Escritorio: diálogo centrado con fade (WINDOWS_PLAN §5.2)
  if (Platform.OS === 'windows' || Platform.OS === 'macos') {
    return (
      <DesktopDialog
        visible={visible}
        onClose={onClose}
        maxWidth={560}
        onEnter={handleSubmit}>
        {body}
      </DesktopDialog>
    );
  }

  // Móvil/tablet: hoja inferior (spec 3.x)
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, {backgroundColor: colors.surfaceSolid}]}>
          {/* Manija */}
          <View style={[styles.handle, {backgroundColor: colors.border}]} />
          {body}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.4)'},
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '92%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {fontWeight: '800', textAlign: 'center', marginBottom: 12},
  label: {fontWeight: '600', marginTop: 12, marginBottom: 6},
  subLabel: {fontWeight: '500', marginTop: 12, marginBottom: 6},
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontWeight: '500',
  },
  chipScroll: {flexDirection: 'row', flexGrow: 0},
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {fontWeight: '600'},
  row2: {flexDirection: 'row', gap: 10},
  flex: {flex: 1},
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  switchLabel: {fontWeight: '600'},
  hint: {marginTop: 2},
});
