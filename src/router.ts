import { useEffect, useState } from 'react'

export type RouteName = 'home' | 'course' | 'review' | 'dict' | 'me' | 'lesson'
export interface Route {
  name: RouteName
  param: string // lesson id for "lesson"
}

const NAMES: RouteName[] = ['home', 'course', 'review', 'dict', 'me', 'lesson']

export function parseHash(hash: string): Route {
  const [name = '', param = ''] = hash.replace(/^#\/?/, '').split('/')
  return NAMES.includes(name as RouteName) ? { name: name as RouteName, param } : { name: 'home', param: '' }
}

/** Hash-based routing: #home, #course, #review, #dict, #me, #lesson/<id>. Works on any static host. */
export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(location.hash))
  useEffect(() => {
    const on = () => {
      setRoute(parseHash(location.hash))
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export const go = (hash: string) => {
  location.hash = hash
}
