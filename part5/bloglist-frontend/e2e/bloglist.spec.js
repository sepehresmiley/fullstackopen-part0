import { test, expect } from '@playwright/test'

const credentials = { username: 'sepehr', password: 'course-pass' }
const apiUrl = 'http://127.0.0.1:3006/api'

test.beforeEach(async ({ request }) => {
  await request.post(`${apiUrl}/testing/reset`)
  await request.post(`${apiUrl}/users`, { data: { ...credentials, name: 'Sepehr Esmaeilipour' } })
  await request.post(`${apiUrl}/blogs`, {
    data: { title: 'A quieter kind of productivity', author: 'Mina Lee', url: 'https://example.com/quiet', likes: 2 },
    headers: { Authorization: `Bearer ${(await (await request.post(`${apiUrl}/login`, { data: credentials })).json()).token}` },
  })
})

test('login form is visible by default', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible()
  await expect(page.getByLabel('Username')).toBeVisible()
})

test('successful login opens authenticated controls and failed login shows an error', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Username').fill(credentials.username)
  await page.getByLabel('Password').fill('wrong-password')
  await page.getByRole('button', { name: /sign in/i }).last().click()
  await expect(page.getByText(/sign-in failed/i)).toBeVisible()
  await page.getByLabel('Password').fill(credentials.password)
  await page.getByRole('button', { name: /sign in/i }).last().click()
  await expect(page.getByText('Sepehr Esmaeilipour', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: /write a note/i })).toBeVisible()
})

test('authenticated reader can publish a note', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Username').fill(credentials.username)
  await page.getByLabel('Password').fill(credentials.password)
  await page.getByRole('button', { name: /sign in/i }).last().click()
  await page.getByRole('link', { name: /write a note/i }).click()
  await page.getByLabel('Title').fill('The systems behind good teams')
  await page.getByLabel('Author').fill('Ari Chen')
  await page.getByLabel('URL').fill('https://example.com/teams')
  await page.getByRole('button', { name: /publish note/i }).click()
  await expect(page.getByRole('link', { name: 'The systems behind good teams' })).toBeVisible()
})

test('reader can like a note and likes sort descending', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Username').fill(credentials.username)
  await page.getByLabel('Password').fill(credentials.password)
  await page.getByRole('button', { name: /sign in/i }).last().click()
  const note = page.getByTestId('blog').filter({ hasText: 'A quieter kind of productivity' })
  await note.getByRole('button', { name: /view details/i }).click()
  await note.getByRole('button', { name: 'Like', exact: true }).click()
  await expect(note.getByText('3 likes')).toBeVisible()
})

test('only the creator sees a delete button and can remove their note', async ({ page }) => {
  await page.goto('/')
  const note = page.getByTestId('blog').filter({ hasText: 'A quieter kind of productivity' })
  await note.getByRole('button', { name: /view details/i }).click()
  await expect(note.getByRole('button', { name: /delete note/i })).toHaveCount(0)
  await page.goto('/login')
  await page.getByLabel('Username').fill(credentials.username)
  await page.getByLabel('Password').fill(credentials.password)
  await page.getByRole('button', { name: /sign in/i }).last().click()
  const ownedNote = page.getByTestId('blog').filter({ hasText: 'A quieter kind of productivity' })
  await ownedNote.getByRole('button', { name: /view details/i }).click()
  page.once('dialog', dialog => dialog.accept())
  await ownedNote.getByRole('button', { name: /delete note/i }).click()
  await expect(ownedNote).toHaveCount(0)
})
