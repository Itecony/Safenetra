import fs from 'fs'
import path from 'path'

const directories = [
    'src/models',
    'database/migrations',
    'database/seeders'
]

const renameFiles = (dir) => {
    if (!fs.existsSync(dir)) return

    const files = fs.readdirSync(dir)

    files.forEach(file => {
        if (file.endsWith('.js')) {
            const oldPath = path.join(dir, file)
            const newPath = path.join(dir, file.replace('.js', '.cjs'))

            // Skip index.cjs or already renamed
            if (fs.existsSync(newPath)) return

            fs.renameSync(oldPath, newPath)
            console.log(`Renamed: ${file} → ${file.replace('.js', '.cjs')}`)
        }
    })
}

directories.forEach(renameFiles)
