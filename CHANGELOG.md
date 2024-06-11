# Changelog

# [1.3.2]() (2024-06-12)

### 📦 Build

- Create only a single `index.html` file in `dist` folder.

# [1.3.0]() (2024-06-11)

### ✨ Features

- Add maximum interaction distance between particles.
- Export and import particles world snapshots.

### 🛠 Improvements

- Add force range when randomly generated to snapshot.

### 📦 Build

- Remove `manualChunks` vite configuration. Avoid unwanted potential bugs.

# [1.2.3]() (2024-06-08)

### 📦 Build

- Edit `manualChunks` vite configuration, to fix production build of broken code.

# [1.2.0]() (2024-06-07)

### ✨ Features

- Add history every time you shuffle particles. Help review the previous one.
- Add smooth sound.

### 🛠 Improvements

- Sound effects are louder when near, softer when far away.

### ⚡️ Performance

- Rewrite some Zdog methods. Performance is slightly improved.

# [1.1.1]() (2024-06-07)

### 🚨 Breaking Changes

- The force range and push back force have been changed to integers on the control panel, making input easier.
- Remove velocity limit. Use the force range instead.

### ✨ Features

- Add sounds when particles collide with each other.

### 🐛 Bug Fixes

- Fix code that has not been deployed to Vercel ([#1](https://github.com/tientq64/particle-life-3d/issues/1)).

### 📚 Documentation

- Create this changelog.

# [1.0.7]() (2024-06-06)

### 🔖 Release

- Already used.

# [0.1.0]() (2024-06-05)

### 🚧 Wip

- Initial.
