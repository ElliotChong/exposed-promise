const { expect } = require('chai')
const ExposedPromise = require('../src')

describe('Exposed Promise', () => {
	it('resolves via exposed resolve method', () => {
		const promise = new ExposedPromise()

		setTimeout(() => {
			promise.resolve(true)
		}, 50)

		return promise.then((success) => {
			expect(success).to.be.true
		})
	})
})
