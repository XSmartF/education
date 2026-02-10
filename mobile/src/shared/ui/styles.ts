import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f6f4f1',
  },
  header: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  headerAction: {
    marginTop: 0,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    marginTop: 10,
    marginBottom: 6,
    color: '#6b7280',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    flex: 1,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginTop: 10,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: '#1d4ed8',
  },
  btnGhost: {
    backgroundColor: '#e5e7eb',
  },
  btnText: {
    color: '#111827',
    fontWeight: '600',
  },
  todoInput: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginVertical: 12,
  },
  todoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  todoTitleWrap: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
  },
  todoActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  todoTitleDone: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  todoDone: {
    opacity: 0.8,
  },
  badge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  error: {
    color: '#b91c1c',
    marginTop: 8,
  },
});
