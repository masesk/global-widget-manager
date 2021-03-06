import {
  CREATE_WINDOW,
  SHOW_WINDOW,
  HIDE_WINDOW,
  UPDATE_INDEX,
  MINIMIZE_WINDOW,
  UNMINIMIZE_WINDOW,
  UNMINIMIZE_UPDATE_INDEX,
  HIDE_WINDOW_ID,
  DELETE_WINDOW,
  LOAD_APPS,
  RESET_DEFAULT,
  UPDATE_WINDOW
} from "../actionTypes";
import * as R from 'ramda'
import { BUILT_IN_APPS } from '../../constants'
let appView = 0;
let opened = {}
const appName = "waim"
const initialState = {
  apps: BUILT_IN_APPS,
  view: []
};

const save = (newstate) => {
  const myStorage = window.localStorage;
  myStorage.setItem(appName, JSON.stringify(newstate.apps));
  return newstate
}

const load = (newstate) => {
  const myStorage = window.localStorage;
  const apps = myStorage.getItem(appName);
  return R.assoc("apps", R.isNil(apps) ? BUILT_IN_APPS : JSON.parse(apps), newstate)
}

const updateIn = R.curry((path, val, obj) => R.compose(
  R.set(R.__, val, obj),
  R.apply(R.compose),
  R.map(R.cond([[R.is(Number), R.lensIndex], [R.T, R.lensProp]]))
)(path));

export default function (state = initialState, action) {
  switch (action.type) {
    case SHOW_WINDOW: {
      const { appid } = action.payload
      if (R.pathEq(["apps", appid, "single"], true, state) && R.propEq(appid, true, opened)) {
        return state
      }
      appView++
      opened[appid] = true
      return R.compose(
        R.assoc("view", R.append({ appid, viewid: appView, zIndex: Number(R.length(R.prop("view", state)) + 1) }, state.view))
      )(state)
    }

    case HIDE_WINDOW: {
      const { index } = action.payload

      delete opened[R.path(["view", index, "appid"], state)]
      const zIndex = R.path(["view", Number(index), "zIndex"], state)
      const viewid = R.path(["view", Number(index), "viewid"], state)
      const length = R.length(state.view)
      const instance = R.compose(
        R.map(([index, win]) => {
          const fviewid = R.prop("viewid", win)
          const fzIndex = R.prop("zIndex", win)
          if (R.equals(fviewid, viewid)) {
            return R.assoc("zIndex", Number(length), win)
          }
          else {
            if (Number(fzIndex) > zIndex) {
              return R.assoc("zIndex", Number(fzIndex) - 1, win)
            }
            else {
              return R.assoc("zIndex", fzIndex, win)
            }
          }
        }),
        R.toPairs,
      )(state.view)
      return R.assoc("view", R.remove(index, 1, instance), state)
    }
    case CREATE_WINDOW: {
      const payload = action.payload;
      const window = {
        appid: payload.appid,
        title: R.propOr("No Title", "title", payload),
        width: R.propOr(500, "width", payload),
        height: R.propOr(500, "height", payload),
        url: R.propOr("", "url", payload),
        single: R.propOr(false, "single", payload),
        deletable: R.propOr(true, "deletable", payload),
        editable: R.propOr(true, "editable", payload)
      }
      return R.compose(
        save,
        R.assocPath(["apps", action.payload.appid], window)
      )(state)
    }
    case UPDATE_INDEX: {
      const { viewid } = action.payload
      const length = R.length(state.view)
      const index = R.findIndex(R.propEq("viewid", viewid))(R.prop("view", state));
      const zIndex = R.path(["view", Number(index), "zIndex"], state)
      if (R.pathEq(["view", Number(index), "zIndex"], length, state)) {
        return state
      }
      const instance = R.compose(
        R.map(([index, win]) => {
          const fviewid = R.prop("viewid", win)
          const fzIndex = R.prop("zIndex", win)
          if (R.equals(fviewid, viewid)) {
            return R.assoc("zIndex", Number(length), win)
          }
          else {
            if (Number(fzIndex) > zIndex) {
              return R.assoc("zIndex", Number(fzIndex) - 1, win)
            }
            else {
              return R.assoc("zIndex", fzIndex, win)
            }
          }
        }),
        R.toPairs,
      )(state.view)
      return R.assoc("view", instance, state)
    }
    case MINIMIZE_WINDOW: {
      const { index } = action.payload
      const updateIn = R.curry((path, val, obj) => R.compose(
        R.set(R.__, val, obj),
        R.apply(R.compose),
        R.map(R.cond([[R.is(Number), R.lensIndex], [R.T, R.lensProp]]))
      )(path));
      return updateIn(["view", Number(index), "minimized"], true, state);

    }
    case UNMINIMIZE_WINDOW: {
      const { index } = action.payload
      return updateIn(["view", Number(index), "minimized"], false, state);

    }

    case UNMINIMIZE_UPDATE_INDEX: {
      const { viewid } = action.payload
      const length = R.length(state.view)
      const index = R.findIndex(R.propEq("viewid", viewid))(R.prop("view", state));
      const zIndex = R.path(["view", Number(index), "zIndex"], state)


      const min = updateIn(["view", Number(index), "minimized"], false, state)
      if (R.pathEq(["view", Number(index), "zIndex"], length, state)) {
        return min
      }
      const instance = R.compose(
        R.map(([index, win]) => {
          const fviewid = R.prop("viewid", win)
          const fzIndex = R.prop("zIndex", win)
          if (R.equals(fviewid, viewid)) {
            return R.assoc("zIndex", Number(length), win)
          }
          else {
            if (Number(fzIndex) > zIndex) {
              return R.assoc("zIndex", Number(fzIndex) - 1, win)
            }
            else {
              return R.assoc("zIndex", fzIndex, win)
            }
          }
        }),
        R.toPairs
      )(min.view)
      return R.assoc("view", instance, state)
    }

    case HIDE_WINDOW_ID: {
      const { viewid } = action.payload
      const index = R.findIndex(R.propEq("viewid", viewid))(R.prop("view", state));
      delete opened[R.path(["view", index, "appid"], state)]
      const zIndex = R.path(["view", Number(index), "zIndex"], state)
      const length = R.length(state.view)
      const instance = R.compose(
        R.map(([index, win]) => {
          const fviewid = R.prop("viewid", win)
          const fzIndex = R.prop("zIndex", win)
          if (R.equals(fviewid, viewid)) {
            return R.assoc("zIndex", Number(length), win)
          }
          else {
            if (Number(fzIndex) > zIndex) {
              return R.assoc("zIndex", Number(fzIndex) - 1, win)
            }
            else {
              return R.assoc("zIndex", fzIndex, win)
            }
          }
        }),
        R.toPairs,
      )(state.view)
      return R.assoc("view", R.remove(index, 1, instance), state)
    }


    case UPDATE_WINDOW: {
      const payload = action.payload;
      const window = {
        appid: payload.appid,
        title: R.propOr("No Title", "title", payload),
        width: R.propOr(500, "width", payload),
        height: R.propOr(500, "height", payload),
        url: R.propOr("", "url", payload),
        single: R.propOr(false, "single", payload),
        deletable: R.propOr(true, "deletable", payload),
        editable: R.propOr(true, "editable", payload)
      }
      delete opened[payload.appid]

      const removed = R.compose(
        save,
        R.assocPath(["apps", payload.appid], window),
        R.assoc("view", R.filter(view => {
          return !R.propEq("appid", payload.appid, view)
        }, state.view)
        ))(state)


      const sorted = R.reverse(R.sortBy(R.prop("zIndex"), removed.view))
      let lengthIndex = sorted.length
      return R.assoc("view", R.compose(
        R.map(([index, win]) => {
          return R.assoc("zIndex", lengthIndex--, win)
        }),
        R.toPairs,
      )(sorted), removed)

    }

    case DELETE_WINDOW: {
      const { appid } = action.payload
      const removed = R.compose(
        save,
        R.dissocPath(["apps", appid]),
        R.assoc("view", R.filter(view => {
          return !R.propEq("appid", appid, view)
        }, state.view)
        ))(state)

      const sorted = R.reverse(R.sortBy(R.prop("zIndex"), removed.view))
      let lengthIndex = sorted.length
      return R.assoc("view", R.compose(
        R.map(([index, win]) => {
          return R.assoc("zIndex", lengthIndex--, win)
        }),
        R.toPairs,
      )(sorted), removed)

    }
    case LOAD_APPS: {
      return load(state)
    }

    case RESET_DEFAULT: {
      opened = {}
      appView = 0
      return R.compose(
        save,
        R.assoc("apps", BUILT_IN_APPS),
        R.assoc("view", [])
      )(state)
    }
    default:
      return state;
  }
}
