import {Controllers} from './controller'
import {parseQueryToInt} from '../util/uapi'

const controllers: Controllers = function (env, db) {
  return {
    async search (req, res) {
      const limit = parseQueryToInt()
    },
    async publish(req, res) {

    }
  }
}

export = controllers
