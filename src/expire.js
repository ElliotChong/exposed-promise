const createPromise = require('./base')
const isFunction = require('lodash/isFunction')
const isNumber = require('lodash/isNumber')
const isPlainObject = require('lodash/isPlainObject')
const merge = require('lodash/merge')

const RESOLVE = 'RESOLVE'
const REJECT = 'REJECT'

// Default to not timing out and rejecting upon timeout
const defaultOptions = {
	timeout: -1,
	timeoutMethod: REJECT,
	timeoutResponse: new Error('Promise timed out.')
}

module.exports = function ExpirableExposedPromise (options, promiseHandler) {
	// Allow parameters to be interchangable
	if (isFunction(options)) {
		if (promiseHandler == null) {
			promiseHandler = options
			options = null
		} else if (isPlainObject(promiseHandler)) {
			const tempOptions = promiseHandler
			promiseHandler = options
			options = tempOptions
		}
	}

	// Ensure default settings are applied
	options = merge({}, defaultOptions, options)
	const { timeout, timeoutResponse } = options
	let timeoutMethod = options.timeoutMethod.toUpperCase()

	// Validate that a valid method was specified
	if (timeoutMethod !== RESOLVE && timeoutMethod !== REJECT) {
		throw new Error('Unknown timeout method specified.')
	}

	const promise = createPromise(promiseHandler)
	const { resolve, reject } = promise

	let timeoutId

	// Abstract the timeout clearing logic
	const scopedClearTimeout = () => {
		if (timeoutId != null) {
			clearTimeout(timeoutId)
			timeoutId = null
		}
	}

	// Hook resolve to clear the timeout
	promise.resolve = function () {
		scopedClearTimeout()

		return resolve.apply(promise, arguments)
	}

	// Hook reject to clear the timeout
	promise.reject = function () {
		scopedClearTimeout()

		return reject.apply(promise, arguments)
	}

	// Start a timer to automatically resolve or reject the Promise after a
	// certain amount of time
	if (isNumber(timeout) && timeout > -1) {
		timeoutId = setTimeout(() => {
			// Normalize
			if (timeoutMethod === REJECT) {
				promise.reject(timeoutResponse)
			} else if (timeoutMethod === RESOLVE) {
				promise.resolve(timeoutResponse)
			}
		}, timeout)
	}

	return promise
}

// Expose the resolve / reject enumerations
module.exports.RESOLVE = RESOLVE
module.exports.REJECT = REJECT
