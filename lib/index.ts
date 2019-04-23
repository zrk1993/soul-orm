// const user = await db.table('user').where('id = :id', { id: 1 }).find();
// const user = await db.table('user').where('id = ?', [1]).find();

// const users = await db.table('user').where({ id: 1 }).select();
// const users = await db.table('user').where('id = :id', { id: 1 }).select();
// const users = await db.table('user').where('id = ?', [1]).select();

// const users = await db.table('user').where({ id: 1 }).field('id, name', 'ta as c').select();

// const users = await db.table('user').where('id = ?', [1]).limit(10, 10).select();

// const users = await db.table('user').where('id = ?', [1]).limit(10, 10).order('id', 'desc').select();

// const users = await db.table('user').where('id = ?', [1]).limit(10, 10).order('id', 'desc').select();

// await db.table('user').insert({ name: 1 });
// await db.table('user').insert([ { name: 1 }, { name: 1 }, { name: 1 } ]);

// await db.table('user').where('').update({ name: 1 });

// await db.table('user').where('').delete();

// const tx = await db.tx();
// await tx.table('user').where({ id: 1 }).find();
// await tx.table('user').where('').delete();
// await tx.commit();
// await tx.rollback();

export * from './query-builder';

export * from './tx';
