module.exports = {
	globals: {
		'ts-jest': {
			tsConfig: './tests/tsconfig.json',
		}
	},
	roots: [
		'<rootDir>/tests',
	],
	transform: {
		'^.+\\.ts': 'ts-jest',
	}
}
