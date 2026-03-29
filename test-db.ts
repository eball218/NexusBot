import postgres from 'postgres';

const sql = postgres('postgresql://postgres.zzphjmjytnbzcdphgpws:d3gUwSeiANS6jcRNs8dn0BCkRnQMut9B@aws-1-us-east-1.pooler.supabase.com:5432/postgres', {
  prepare: false,
  connect_timeout: 10,
});

console.log('Connecting via session pooler (aws-1, port 5432)...');

sql`SELECT 1 as test`
  .then((r) => {
    console.log('SUCCESS:', JSON.stringify(r));
    return sql.end();
  })
  .catch((e) => {
    console.error('FAIL:', e.message);
    return sql.end();
  });
