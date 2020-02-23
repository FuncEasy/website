import { combineReducers } from 'redux'
import {
  GET_AUTH_PENDING,
  GET_AUTH_SUCCESS,
  GET_AUTH_FAIL,
} from '../actions';
const authReducer = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case GET_AUTH_PENDING:
      return Object.assign({}, state, {
        status: 'Pending',
        data: null,
        error: null,
      });
    case GET_AUTH_SUCCESS:
      return Object.assign({}, state, {
        status: 'Success',
        data: payload,
        error: null,
      });
    case GET_AUTH_FAIL:
      return Object.assign({}, state, {
        status: 'Fail',
        data: null,
        error: payload,
      });
    default:
      return state;
  }
};
let reducer = combineReducers({
  auth: authReducer,
});
export default reducer;