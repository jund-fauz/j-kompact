import { initObject, log } from './src'

const objectTest = initObject()
objectTest.set({ test: ['a', 'b', 'c'] })
log(objectTest.object)