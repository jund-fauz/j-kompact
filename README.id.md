# j-kompact

[English](./README.md) | **Bahasa Indonesia**

Library utilitas untuk memanipulasi data di aplikasi JavaScript / TypeScript.
Menyediakan class `Array`, `Object`, `String`, dan `Date` yang lebih lengkap,
ditambah helper kecil untuk perbandingan, perulangan, dan logging. Bisa dipakai di
**Node.js / Bun** maupun **Google Apps Script**.

- Helper dengan indeks mulai dari 1 (`get(1)` adalah item pertama), cocok untuk
  pengolahan data spreadsheet.
- Operasi `MLArray` yang bisa dirantai (chaining) dan langsung mengubah array
  (in-place): `change`, `unique`, `lazyFlat`, `flatPush`, dan lainnya.
- `log`, `wait`, dan `MLDate.format` menyesuaikan environment: memakai `Logger`,
  `Utilities.sleep`, dan `Utilities.formatDate` di Google Apps Script, serta
  `console`, `Atomics.wait`, dan `dayjs` di luar itu.
- Ditulis dengan TypeScript dan sudah menyertakan deklarasi tipe.

## Instalasi

```bash
npm install j-kompact
# atau
bun add j-kompact
```

Paket ini hanya mendukung ESM.

```ts
import { initArray, initObject, initString, initDate } from 'j-kompact'
```

Saat paket di-import, dua method juga ditambahkan ke `Array.prototype`:
`asMLArray()` dan `lazyFlat()`. Di kode TypeScript, sebaiknya gunakan
`initArray(array)` yang tipenya lengkap.

## Penggunaan

### Array (`MLArray`)

`MLArray` merupakan turunan dari `Array` bawaan, jadi semua method bawaan tetap bisa dipakai.

```ts
import { initArray, MLArray, Descending } from 'j-kompact'

const list = initArray([3, 1, [2, [4]]], { flatting: true }) // MLArray [3, 1, 2, 4]

list.get(1)              // 3            (indeks mulai dari 1)
list.get(-1)             // 4
list.get(1, 2)           // MLArray [3, 1]
list.locationOf(2)       // 3            (indexOf mulai dari 1, 0 jika tidak ada)
list.slice(2, 3)         // MLArray [1, 2] (start mulai dari 1)
list.sort(Descending)    // MLArray [4, 3, 2, 1]
list.sum()               // 10
list.minMax()            // [1, 4]

initArray(['a', 'b', 'c']).readableJoin()                // 'a, b dan c'
initArray(['a', 'b', 'c']).readableJoin({ and: 'atau' }) // 'a, b atau c'

initArray([1, 1, 2, null]).unique()                      // MLArray [1, 2]
initArray([1, 2, 3, 4]).filter(n => n % 2 === 0)         // MLArray baru: [2, 4] (seperti bawaan)
initArray([1, 2, 3, 4]).change(n => n % 2 === 0)         // in-place: [2, 4]
initArray([1]).flatPush([2, [3]], 4)                     // in-place & bisa dirantai: [1, 2, 3, 4]
initArray(['0.1', '0.2']).sum()                          // 0.3

// Array 2 dimensi (misalnya nilai dari spreadsheet)
const rows = initArray([[1, 'a'], [2, 'b']])
rows.extract(1)    // MLArray [1, 2]   (kolom pertama)
rows.toParam()     // [[1, 2], ['a', 'b']] (transpose)
rows.toObject()    // MLObject { 1: 'a', 2: 'b' }

// Mencari rentang data yang cocok secara berurutan (indeks mulai dari 0)
initArray(['x', 'a', 'a', 'y', 'a'], { withLog: false }).search('a') // [[1, 2], [4, 4]]

MLArray.repeat('-', 3)  // MLArray ['-', '-', '-']
;[1, 2].asMLArray()     // MLArray [1, 2]
```

Opsi `initArray`: `flatting`, `deleteNull`, `unique`, `withLog` (default `true`;
isi `false` untuk mematikan log debug dari `search` dan `slice`).

> Sejak 0.2.0, `push` dan `filter` berperilaku seperti method bawaan. Gunakan
> `flatPush` dan `change` untuk versi yang in-place dan bisa dirantai. Lihat
> [CHANGELOG](./CHANGELOG.md#020---2026-11-12).

### Object (`MLObject`)

```ts
import { initObject, toJSObject, parse, isObject, isEmpty } from 'j-kompact'

const user = initObject({ name: 'Jundi', city: 'Bandung' })

user.name                       // 'Jundi' (key juga bisa diakses sebagai properti)
user.get('name', 'city')        // MLArray ['Jundi', 'Bandung']
user.keys                       // MLArray ['name', 'city']
user.getKeyByValue('Bandung')   // MLString 'city'
user.reverse()                  // MLObject { Jundi: 'name', Bandung: 'city' }
user.filter((key, value) => key === 'city') // MLObject { city: 'Bandung' }
user.set('age', 25).delete('city')
user.object                     // { name: 'Jundi', age: 25 }

toJSObject(user)                // object JavaScript biasa
parse([['a', 1], ['b', 2]])     // { a: 1, b: 2 }
parse('{"a":1}')                // { a: 1 }
isObject({}), isEmpty({})       // true, true
```

### String (`MLString`)

```ts
import { initString, formatNumber, Or } from 'j-kompact'

initString('nama lengkap').toCamelCase()              // 'namaLengkap'
initString('namaLengkap').normalizeFromCamelCase()    // 'Nama lengkap'
initString('hELLO').capitalize()                      // 'Hello'
initString('laporan.XLSX').endWith('.xlsx', { caseInsensitive: true }) // true
initString('never say never').includes('say', 'xyz', { logic: Or })   // true
formatNumber(7)                                       // '07'
```

### Tanggal (`MLDate`)

```ts
import { initDate, isDate } from 'j-kompact'

const date = initDate({ year: 2026, month: 'JULI', date: 1 }) // bisa juga 'JUL' atau 7

date.month       // 7 (mulai dari 1)
date.longMonth   // 'JULI'
date.shortMonth  // 'JUL'
date.lastDate    // 31
date.nextMonth() // MLDate baru, 1 Agustus 2026
date.lastMonth() // MLDate baru, 1 Juni 2026

date.setDate(20).setMonth('SEPTEMBER').setHours(8, 30) // bisa dirantai
date.format('dd MMMM yyyy HH:mm')                      // timezone default 'Asia/Jakarta'
date.format('yyyy-MM-dd', 'UTC')

isDate('1 Jul 2026')  // true
```

`initDate` menerima argumen yang sama dengan `new Date(...)`, objek `Date` /
`MLDate`, atau objek `{ year, month, date }` yang bagian kosongnya diisi dengan
tanggal hari ini.

### Angka

```ts
import { range } from 'j-kompact'

range(1, 5)   // [1, 2, 3, 4, 5] (inklusif)
range(-1, 1)  // [-1, 0, 1]
range(5, 1)   // error: 'until' should be greater than or equal to 'from'
```

### Perbandingan

```ts
import { isSame, sameWith, notSameWith, between, lowerThan, isTypeOf, Or } from 'j-kompact'

isSame(1, 1, 1)                        // true
sameWith('a', 'a', 'b', { logic: Or }) // true
notSameWith('a', 'b', 'c')             // true
between(1, 2, 3)                       // true  (1 < 2 < 3)
between(1, 3, 3, '<<=')                // true  (1 < 3 <= 3); tersedia juga '<=' dan '<=<'
lowerThan(1, 2, 3)                     // true
isTypeOf('string', 'a', 1, { logic: Or }) // true
```

### Perulangan

```ts
import { iterate, retry, Break } from 'j-kompact'

iterate(i => i * 2, { from: 1, until: 3 })   // [2, 4, 6]
iterate(i => (i === 3 ? Break : i), { until: 5 }) // [1, 2]

const data = retry(() => ambilData(), {
  attempts: 3,         // default 3
  waitingInSec: 2,     // jeda antar percobaan = percobaan ke-n * waitingInSec detik
  withReturnValue: true,
  fallback: []         // nilai atau fungsi, dipakai setelah percobaan terakhir gagal
})
```

### Helper lainnya

```ts
import { trim, reverseBoolean, ifTrue, log, wait, templateLogError } from 'j-kompact'

trim({ name: ' Jundi ', tags: [' a '] }, { useJsObject: true }) // { name: 'Jundi', tags: ['a'] }
reverseBoolean('TRUE')   // 'FALSE'
ifTrue(false, 'tampil')  // ''
log('pesan', { a: 1 })   // Logger.log di Apps Script, console.log di luar itu
wait(1)                  // berhenti selama 1 detik

try {
  prosesData()
} catch (e) {
  templateLogError(e as Error, 'prosesData', { prefixMessage: 'Sinkronisasi gagal', withThrow: false })
}
```

### Google Spreadsheet

```ts
import { toMLDate, isYear } from 'j-kompact'

toMLDate(46204)  // MLDate untuk 2026-07-01 (UTC) dari angka serial tanggal spreadsheet
isYear('2026')   // true (rentang valid: 1999 - 2099)
```

## Pengembangan

```bash
bun install
bun run test    # vitest
bun run build   # kompilasi ke dist/
```

Riwayat rilis ada di [CHANGELOG.md](./CHANGELOG.md).

## Bantuan AI

Projek ini dikembangkan dengan bantuan AI (untuk tes, dokumentasi, dan beberapa
perbaikan bug). Semua perubahan ditinjau dan dikelola oleh penulis.

## Lisensi

[MPL-2.0](./LICENSE)
