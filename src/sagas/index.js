import { all, take, call, put, takeEvery } from 'redux-saga/effects';
import http from '../service';
import {
  GET_AUTH_REQUEST,
  GET_AUTH_PENDING,
  GET_AUTH_FAIL,
  GET_AUTH_SUCCESS
} from '../actions';

function* getAuth() {
    try {
      yield put({ type: GET_AUTH_PENDING });
      const res = yield call(http.get, '/auth');
      if (res) yield put({ type: GET_AUTH_SUCCESS, payload: res.data});
    } catch (e) {
      yield put({ type: GET_AUTH_FAIL, payload: e.message});
    }
}

function* watchGetAuthAsync() {
  yield takeEvery(GET_AUTH_REQUEST, getAuth)
}

export default function* rootSaga() {
  yield all([
    watchGetAuthAsync()
  ])
}