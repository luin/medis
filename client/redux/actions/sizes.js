import {createAction} from 'Utils';

export const setSize = createAction('SET_SIZE', (type, value) => ({type, value: Number(value)}))
