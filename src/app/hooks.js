import { useDispatch, useSelector } from 'react-redux';

/** Thin, centralised wrappers so components never import react-redux directly. */
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
