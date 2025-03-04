/**
 * WordPress dependencies
 */
import { controls } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';

jest.mock( '@wordpress/api-fetch' );

/**
 * Internal dependencies
 */
import {
	editEntityRecord,
	saveEntityRecord,
	deleteEntityRecord,
	receiveUserPermission,
	receiveAutosaves,
	receiveCurrentUser,
	__experimentalBatch,
} from '../actions';

jest.mock( '../locks/actions', () => ( {
	__unstableAcquireStoreLock: jest.fn( () => [
		{
			type: 'MOCKED_ACQUIRE_LOCK',
		},
	] ),
	__unstableReleaseStoreLock: jest.fn( () => [
		{
			type: 'MOCKED_RELEASE_LOCK',
		},
	] ),
} ) );

jest.mock( '../batch', () => {
	const { createBatch } = jest.requireActual( '../batch' );
	return {
		createBatch() {
			return createBatch( ( inputs ) => Promise.resolve( inputs ) );
		},
	};
} );

describe( 'editEntityRecord', () => {
	it( 'throws when the edited entity does not have a loaded config.', () => {
		const entity = { kind: 'someKind', name: 'someName', id: 'someId' };
		const fulfillment = editEntityRecord(
			entity.kind,
			entity.name,
			entity.id,
			{}
		);
		expect( fulfillment.next().value ).toEqual(
			controls.select( 'core', 'getEntity', entity.kind, entity.name )
		);

		// Don't pass back an entity config.
		expect( fulfillment.next.bind( fulfillment ) ).toThrow(
			`The entity being edited (${ entity.kind }, ${ entity.name }) does not have a loaded config.`
		);
	} );
} );

describe( 'deleteEntityRecord', () => {
	it( 'triggers a DELETE request for an existing record', async () => {
		const post = 10;
		const entities = [
			{ name: 'post', kind: 'postType', baseURL: '/wp/v2/posts' },
		];
		const fulfillment = deleteEntityRecord( 'postType', 'post', post );

		// Trigger generator
		fulfillment.next();

		// Acquire lock
		expect( fulfillment.next( entities ).value.type ).toBe(
			'MOCKED_ACQUIRE_LOCK'
		);

		// Start
		expect( fulfillment.next().value.type ).toEqual(
			'DELETE_ENTITY_RECORD_START'
		);

		// delete api call
		const { value: apiFetchAction } = fulfillment.next();
		expect( apiFetchAction.request ).toEqual( {
			path: '/wp/v2/posts/10',
			method: 'DELETE',
		} );

		expect( fulfillment.next().value.type ).toBe( 'REMOVE_ITEMS' );

		expect( fulfillment.next().value.type ).toBe(
			'DELETE_ENTITY_RECORD_FINISH'
		);

		// Release lock
		expect( fulfillment.next().value.type ).toEqual(
			'MOCKED_RELEASE_LOCK'
		);

		expect( fulfillment.next() ).toMatchObject( {
			done: true,
			value: undefined,
		} );
	} );
} );

describe( 'saveEntityRecord', () => {
	beforeEach( async () => {
		apiFetch.mockReset();
		jest.useFakeTimers();
	} );

	it( 'triggers a POST request for a new record', async () => {
		const post = { title: 'new post' };
		const entities = [
			{ name: 'post', kind: 'postType', baseURL: '/wp/v2/posts' },
		];
		const select = {
			getRawEntityRecord: () => post,
		};

		const dispatch = Object.assign( jest.fn(), {
			receiveEntityRecords: jest.fn(),
		} );
		// Provide entities
		dispatch.mockReturnValueOnce( entities );

		// Provide response
		const updatedRecord = { ...post, id: 10 };
		apiFetch.mockImplementation( () => {
			return updatedRecord;
		} );

		const result = await saveEntityRecord(
			'postType',
			'post',
			post
		)( { select, dispatch } );

		expect( apiFetch ).toHaveBeenCalledTimes( 1 );
		expect( apiFetch ).toHaveBeenCalledWith( {
			path: '/wp/v2/posts',
			method: 'POST',
			data: post,
		} );

		expect( dispatch ).toHaveBeenCalledTimes( 5 );
		expect( dispatch ).toHaveBeenCalledWith( {
			type: 'SAVE_ENTITY_RECORD_START',
			kind: 'postType',
			name: 'post',
			recordId: undefined,
			isAutosave: false,
		} );
		expect( dispatch ).toHaveBeenCalledWith( [
			{
				type: 'MOCKED_ACQUIRE_LOCK',
			},
		] );
		expect( dispatch ).toHaveBeenCalledWith( {
			type: 'SAVE_ENTITY_RECORD_FINISH',
			kind: 'postType',
			name: 'post',
			recordId: undefined,
			error: undefined,
			isAutosave: false,
		} );
		expect( dispatch ).toHaveBeenCalledWith( [
			{
				type: 'MOCKED_RELEASE_LOCK',
			},
		] );

		expect( dispatch.receiveEntityRecords ).toHaveBeenCalledTimes( 1 );
		expect( dispatch.receiveEntityRecords ).toHaveBeenCalledWith(
			'postType',
			'post',
			updatedRecord,
			undefined,
			true,
			post
		);

		expect( result ).toBe( updatedRecord );
	} );

	it( 'triggers a PUT request for an existing record', async () => {
		const post = { id: 10, title: 'new post' };
		const entities = [
			{ name: 'post', kind: 'postType', baseURL: '/wp/v2/posts' },
		];
		const select = {
			getRawEntityRecord: () => post,
		};

		const dispatch = Object.assign( jest.fn(), {
			receiveEntityRecords: jest.fn(),
		} );
		// Provide entities
		dispatch.mockReturnValueOnce( entities );

		// Provide response
		const updatedRecord = { ...post, id: 10 };
		apiFetch.mockImplementation( () => {
			return updatedRecord;
		} );

		const result = await saveEntityRecord(
			'postType',
			'post',
			post
		)( { select, dispatch } );

		expect( apiFetch ).toHaveBeenCalledTimes( 1 );
		expect( apiFetch ).toHaveBeenCalledWith( {
			path: '/wp/v2/posts/10',
			method: 'PUT',
			data: post,
		} );

		expect( dispatch ).toHaveBeenCalledTimes( 5 );
		expect( dispatch ).toHaveBeenCalledWith( {
			type: 'SAVE_ENTITY_RECORD_START',
			kind: 'postType',
			name: 'post',
			recordId: 10,
			isAutosave: false,
		} );
		expect( dispatch ).toHaveBeenCalledWith( [
			{
				type: 'MOCKED_ACQUIRE_LOCK',
			},
		] );
		expect( dispatch ).toHaveBeenCalledWith( {
			type: 'SAVE_ENTITY_RECORD_FINISH',
			kind: 'postType',
			name: 'post',
			recordId: 10,
			error: undefined,
			isAutosave: false,
		} );
		expect( dispatch ).toHaveBeenCalledWith( [
			{
				type: 'MOCKED_RELEASE_LOCK',
			},
		] );

		expect( dispatch.receiveEntityRecords ).toHaveBeenCalledTimes( 1 );
		expect( dispatch.receiveEntityRecords ).toHaveBeenCalledWith(
			'postType',
			'post',
			updatedRecord,
			undefined,
			true,
			post
		);

		expect( result ).toBe( updatedRecord );
	} );

	it( 'triggers a PUT request for an existing record with a custom key', async () => {
		const postType = { slug: 'page', title: 'Pages' };
		const entities = [
			{
				name: 'postType',
				kind: 'root',
				baseURL: '/wp/v2/types',
				key: 'slug',
			},
		];
		const select = {
			getRawEntityRecord: () => ( {} ),
		};

		const dispatch = Object.assign( jest.fn(), {
			receiveEntityRecords: jest.fn(),
		} );
		// Provide entities
		dispatch.mockReturnValueOnce( entities );

		// Provide response
		apiFetch.mockImplementation( () => postType );

		const result = await saveEntityRecord(
			'root',
			'postType',
			postType
		)( { select, dispatch } );

		expect( apiFetch ).toHaveBeenCalledTimes( 1 );
		expect( apiFetch ).toHaveBeenCalledWith( {
			path: '/wp/v2/types/page',
			method: 'PUT',
			data: postType,
		} );

		expect( dispatch ).toHaveBeenCalledTimes( 5 );
		expect( dispatch ).toHaveBeenCalledWith( {
			type: 'SAVE_ENTITY_RECORD_START',
			kind: 'root',
			name: 'postType',
			recordId: 'page',
			isAutosave: false,
		} );
		expect( dispatch ).toHaveBeenCalledWith( [
			{
				type: 'MOCKED_ACQUIRE_LOCK',
			},
		] );
		expect( dispatch ).toHaveBeenCalledWith( {
			type: 'SAVE_ENTITY_RECORD_FINISH',
			kind: 'root',
			name: 'postType',
			recordId: 'page',
			error: undefined,
			isAutosave: false,
		} );
		expect( dispatch ).toHaveBeenCalledWith( [
			{
				type: 'MOCKED_RELEASE_LOCK',
			},
		] );

		expect( dispatch.receiveEntityRecords ).toHaveBeenCalledTimes( 1 );
		expect( dispatch.receiveEntityRecords ).toHaveBeenCalledWith(
			'root',
			'postType',
			postType,
			undefined,
			true,
			{ slug: 'page', title: 'Pages' }
		);

		expect( result ).toBe( postType );
	} );
} );

describe( 'receiveUserPermission', () => {
	it( 'builds an action object', () => {
		expect( receiveUserPermission( 'create/media', true ) ).toEqual( {
			type: 'RECEIVE_USER_PERMISSION',
			key: 'create/media',
			isAllowed: true,
		} );
	} );
} );

describe( 'receiveAutosaves', () => {
	it( 'builds an action object', () => {
		const postId = 1;
		const autosaves = [
			{
				content: 'test 1',
			},
			{
				content: 'test 2',
			},
		];

		expect( receiveAutosaves( postId, autosaves ) ).toEqual( {
			type: 'RECEIVE_AUTOSAVES',
			postId,
			autosaves,
		} );
	} );

	it( 'converts singular autosaves into an array', () => {
		const postId = 1;
		const autosave = {
			content: 'test 1',
		};

		expect( receiveAutosaves( postId, autosave ) ).toEqual( {
			type: 'RECEIVE_AUTOSAVES',
			postId,
			autosaves: [ autosave ],
		} );
	} );
} );

describe( 'receiveCurrentUser', () => {
	it( 'builds an action object', () => {
		const currentUser = { id: 1 };
		expect( receiveCurrentUser( currentUser ) ).toEqual( {
			type: 'RECEIVE_CURRENT_USER',
			currentUser,
		} );
	} );
} );

describe( '__experimentalBatch', () => {
	it( 'batches multiple actions together', async () => {
		const generator = __experimentalBatch(
			[
				( { saveEntityRecord: _saveEntityRecord } ) =>
					_saveEntityRecord( 'root', 'widget', {} ),
				( { saveEditedEntityRecord: _saveEditedEntityRecord } ) =>
					_saveEditedEntityRecord( 'root', 'widget', 123 ),
				( { deleteEntityRecord: _deleteEntityRecord } ) =>
					_deleteEntityRecord( 'root', 'widget', 123, {} ),
			],
			{ __unstableProcessor: ( inputs ) => Promise.resolve( inputs ) }
		);
		// Run generator up to `yield getDispatch()`.
		const { value: getDispatchControl } = generator.next();
		expect( getDispatchControl ).toEqual( { type: 'GET_DISPATCH' } );
		const actions = {
			saveEntityRecord: jest.fn(
				( kind, name, record, { __unstableFetch } ) => {
					__unstableFetch( {} );
					return { id: 123, created: true };
				}
			),
			saveEditedEntityRecord: jest.fn(
				( kind, name, recordId, { __unstableFetch } ) => {
					__unstableFetch( {} );
					return { id: 123, updated: true };
				}
			),
			deleteEntityRecord: jest.fn(
				( kind, name, recordId, query, { __unstableFetch } ) => {
					__unstableFetch( {} );
					return { id: 123, deleted: true };
				}
			),
		};
		const dispatch = () => actions;
		// Run generator up to `yield __unstableAwaitPromise( ... )`.
		const { value: awaitPromiseControl } = generator.next( dispatch );
		expect( actions.saveEntityRecord ).toHaveBeenCalledWith(
			'root',
			'widget',
			{},
			{ __unstableFetch: expect.any( Function ) }
		);
		expect( actions.saveEditedEntityRecord ).toHaveBeenCalledWith(
			'root',
			'widget',
			123,
			{ __unstableFetch: expect.any( Function ) }
		);
		expect( actions.deleteEntityRecord ).toHaveBeenCalledWith(
			'root',
			'widget',
			123,
			{},
			{ __unstableFetch: expect.any( Function ) }
		);
		expect( awaitPromiseControl ).toEqual( {
			type: 'AWAIT_PROMISE',
			promise: expect.any( Promise ),
		} );
		// Run generator to the end.
		const { value: results } = generator.next(
			await awaitPromiseControl.promise
		);
		expect( results ).toEqual( [
			{ id: 123, created: true },
			{ id: 123, updated: true },
			{ id: 123, deleted: true },
		] );
	} );
} );
