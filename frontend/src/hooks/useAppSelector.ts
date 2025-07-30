import { useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState } from '../store';

// Use throughout your app instead of plain `useSelector`
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default useAppSelector; 