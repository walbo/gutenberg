/**
 * External dependencies
 */
import { basename, join } from 'path';
import { writeFileSync } from 'fs';

/**
 * WordPress dependencies
 */
import {
	trashAllPosts,
	activateTheme,
	canvas,
} from '@wordpress/e2e-test-utils';

/**
 * Internal dependencies
 */
import { siteEditor } from '../../experimental-features';
import { readFile, deleteFile, getLoadTimestamps } from './utils';

jest.setTimeout( 1000000 );

describe( 'Site Editor Performance', () => {
	beforeAll( async () => {
		await activateTheme( 'tt1-blocks' );
		await trashAllPosts( 'wp_template' );
		await trashAllPosts( 'wp_template', 'auto-draft' );
		await trashAllPosts( 'wp_template_part' );
	} );
	afterAll( async () => {
		await trashAllPosts( 'wp_template' );
		await trashAllPosts( 'wp_template_part' );
		await activateTheme( 'twentytwentyone' );
	} );

	it( 'Loading', async () => {
		const results = {
			firstPaint: [],
			domContentLoaded: [],
			firstContentfulPaint: [],
			blockLoaded: [],
			type: [],
			focus: [],
			inserterOpen: [],
			inserterHover: [],
		};

		await siteEditor.visit();

		let i = 3;

		const traceFile = __dirname + '/trace.json';
		let traceResults;

		// Measuring loading time
		while ( i-- ) {
			await page.tracing.start( {
				path: traceFile,
				screenshots: false,
			} );
			const startTime = new Date();
			await page.reload();
			await page.waitForSelector( '.edit-site-visual-editor', {
				timeout: 120000,
			} );
			await canvas().waitForSelector( '.wp-block', { timeout: 120000 } );
			const blockLoaded = new Date() - startTime;
			await page.tracing.stop();
			traceResults = JSON.parse( readFile( traceFile ) );
			const {
				firstPaint,
				domContentLoaded,
				firstContentfulPaint,
			} = getLoadTimestamps( traceResults, await page.url() );

			results.firstPaint.push( firstPaint );
			results.domContentLoaded.push( domContentLoaded );
			results.firstContentfulPaint.push( firstContentfulPaint );
			results.blockLoaded.push( blockLoaded );
		}

		const resultsFilename = basename( __filename, '.js' ) + '.results.json';

		writeFileSync(
			join( __dirname, resultsFilename ),
			JSON.stringify( results, null, 2 )
		);

		deleteFile( traceFile );

		expect( true ).toBe( true );
	} );
} );
