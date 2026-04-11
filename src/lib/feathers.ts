import { feathers } from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
import rest from '@feathersjs/rest-client'
import auth from '@feathersjs/authentication-client'
import io from 'socket.io-client'
import api from './api'
import { cookieStorage } from './storage'

const socket = io('http://localhost:3030', {
  transports: ['websocket']
})

// The Feathers client application
const client = feathers()

// Configure Socket.io transport
const socketClient = socketio(socket)

// Configure REST transport (using our axios instance)
const restClient = rest('http://localhost:3030').axios(api)

// By default we use socketio, but restClient is available
client.configure(socketClient)

// Configure authentication
client.configure(auth({
  storage: cookieStorage,
  storageKey: 'feathers-jwt'
}))

export { client, restClient, socketClient }

