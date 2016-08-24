let NormalPromise = Promise

// Bluebird is used if available, otherwise fallback to native Promise
try {
	let Bluebird = require('bluebird')
	NormalPromise = Bluebird
} catch (error) {}

module.exports = function ExposedPromise (promiseHandler) {
	let exposedResolve
	let exposedReject

	// Generate a Promise instance and hoist resolve / reject
	const promise = new NormalPromise((resolve, reject) => {
		exposedResolve = resolve
		exposedReject = reject

		if (promiseHandler != null) {
			promiseHandler.apply(this, arguments)
		}
	})

	// Wrap resolve
	promise.resolve = function () {
		return exposedResolve.apply(this, arguments)
	}

	// Wrap reject
	promise.reject = function () {
		return exposedReject.apply(this, arguments)
	}

	return promise
}
