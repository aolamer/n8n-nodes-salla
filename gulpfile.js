const { src, dest, parallel } = require('gulp');

function buildIcons() {
	return src('nodes/**/*.{png,svg}')
		.pipe(dest('dist/'));
}

function copyDocs() {
	return src(['README.md', 'INSTALLATION.md'])
		.pipe(dest('dist/'));
}

exports.build = parallel(buildIcons, copyDocs);
exports['build:icons'] = buildIcons;
exports['copy:docs'] = copyDocs; 