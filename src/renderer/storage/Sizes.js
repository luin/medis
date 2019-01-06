'use strict'

export function get() {
  const data = localStorage.getItem('sizes')
  return data ? JSON.parse(data) : {}
}

export function set(sizes) {
  localStorage.setItem('sizes', JSON.stringify(sizes))
  return sizes
}
