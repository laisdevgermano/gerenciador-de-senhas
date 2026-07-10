const https = require('https')

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { ...options, timeout: 30000 }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        let parsed = null
        try { parsed = JSON.parse(data) } catch {}
        resolve({ status: res.statusCode, headers: res.headers, body: data, json: parsed })
      })
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
    if (options.body) req.write(options.body)
    req.end()
  })
}

const BASE = 'https://gerenciador-de-senhas-chi.vercel.app'

;(async () => {
  try {
    console.log('1. Login...')
    const loginRes = await request(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'caique@germano.com', passphrase: 'senha123' })
    })
    console.log(`   Status: ${loginRes.status}`)
    console.log('   Body:', loginRes.body.substring(0, 200))
    
    const setCookie = loginRes.headers['set-cookie']
    const cookie = setCookie ? setCookie.map(c => c.split(';')[0]).join('; ') : ''
    console.log('   Cookie:', cookie ? 'YES' : 'NO')

    if (loginRes.status !== 200 || !cookie) {
      console.log('Login failed, aborting.')
      return
    }

    // 2. Get folders
    console.log('\n2. GET /api/folders...')
    const foldersRes = await request(`${BASE}/api/folders`, {
      headers: { 'Cookie': cookie }
    })
    console.log(`   Status: ${foldersRes.status}`)
    console.log('   Body:', foldersRes.body.substring(0, 300))

    // 3. Get users
    console.log('\n3. GET /api/users...')
    const usersRes = await request(`${BASE}/api/users`, {
      headers: { 'Cookie': cookie }
    })
    console.log(`   Status: ${usersRes.status}`)
    console.log('   Body:', usersRes.body.substring(0, 300))

    // 4. Get tags
    console.log('\n4. GET /api/tags...')
    const tagsRes = await request(`${BASE}/api/tags`, {
      headers: { 'Cookie': cookie }
    })
    console.log(`   Status: ${tagsRes.status}`)
    console.log('   Body:', tagsRes.body.substring(0, 300))

    // 5. Upload to folder
    const folderId = foldersRes.json?.[0]?.id
    if (folderId) {
      console.log(`\n5. POST /api/folders/${folderId}/documents (upload)...`)
      const boundary = '----B' + Date.now()
      const body = Buffer.from([
        `--${boundary}`,
        'Content-Disposition: form-data; name="file"; filename="teste.txt"',
        'Content-Type: text/plain',
        '',
        'conteudo teste vercel',
        `--${boundary}--`
      ].join('\r\n'))
      const upRes = await request(`${BASE}/api/folders/${folderId}/documents`, {
        method: 'POST',
        headers: { 'Cookie': cookie, 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'Content-Length': String(body.length) },
        body
      })
      console.log(`   Status: ${upRes.status}`)
      console.log('   Body:', upRes.body.substring(0, 500))
    }

    // 6. Upload to user (Lais)
    const lais = usersRes.json?.find(u => u.name?.includes('Lais'))
    if (lais) {
      console.log(`\n6. POST /api/users/${lais.id}/documents (upload to Lais)...`)
      const boundary = '----B' + Date.now()
      const body = Buffer.from([
        `--${boundary}`,
        'Content-Disposition: form-data; name="file"; filename="lais-teste.txt"',
        'Content-Type: text/plain',
        '',
        'teste para lais',
        `--${boundary}--`
      ].join('\r\n'))
      const upRes = await request(`${BASE}/api/users/${lais.id}/documents`, {
        method: 'POST',
        headers: { 'Cookie': cookie, 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'Content-Length': String(body.length) },
        body
      })
      console.log(`   Status: ${upRes.status}`)
      console.log('   Body:', upRes.body.substring(0, 500))
    }

    // 7. List folder docs
    if (folderId) {
      console.log(`\n7. GET /api/folders/${folderId}/documents (list)...`)
      const docsRes = await request(`${BASE}/api/folders/${folderId}/documents`, {
        headers: { 'Cookie': cookie }
      })
      console.log(`   Status: ${docsRes.status}`)
      console.log('   Body:', docsRes.body.substring(0, 500))
    }

    // 8. List user docs
    if (lais) {
      console.log(`\n8. GET /api/users/${lais.id}/documents (list)...`)
      const docsRes = await request(`${BASE}/api/users/${lais.id}/documents`, {
        headers: { 'Cookie': cookie }
      })
      console.log(`   Status: ${docsRes.status}`)
      console.log('   Body:', docsRes.body.substring(0, 500))
    }

    // 9. If we have a doc, test download
    if (folderId) {
      console.log(`\n9. GET /api/folders/${folderId}/documents (check for docs to download)...`)
      const docsRes = await request(`${BASE}/api/folders/${folderId}/documents`, {
        headers: { 'Cookie': cookie }
      })
      const doc = docsRes.json?.[0]
      if (doc) {
        console.log(`   Found doc: ${doc.id} - ${doc.name}`)
        console.log('10. GET /api/documents/' + doc.id + '/view...')
        const viewRes = await request(`${BASE}/api/documents/${doc.id}/view`, {
          headers: { 'Cookie': cookie }
        })
        console.log(`   Status: ${viewRes.status}`)
        console.log('   Body:', viewRes.body.substring(0, 300))
      }
    }

    console.log('\n=== DONE ===')
  } catch (e) {
    console.error('FATAL:', e.message)
  }
})()
