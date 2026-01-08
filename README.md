# 🃏 Joker Smash

<div align="center">

![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12.5-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

**A real-time multiplayer card game where strategy meets speed!**

[Play Now](#getting-started) • [How to Play](#how-to-play) • [Features](#features)

</div>

---

## 📖 About

**Joker Smash** is an exciting online multiplayer card game built with modern web technologies. Race against other players to be the first to empty your hand by forming valid sets (groups and sequences) and placing them on the board. The twist? Jokers are wild cards that can substitute any card, but opponents can steal them back!

## ✨ Features

- 🌐 **Real-time Multiplayer** - Play with friends online using Firebase real-time sync
- 🔐 **Google Authentication** - Secure sign-in with your Google account
- 🎮 **Customizable Games** - Configure player limits, turn timers, deck count, and cards per hand
- 💬 **In-Game Chat** - Communicate with opponents during gameplay
- ⏱️ **Timed Turns** - Keep the game moving with configurable turn timers
- 🏆 **Victory Celebrations** - Confetti animations for winners
- 🎨 **Beautiful UI** - Pixel-art styled interface with smooth animations
- 📱 **Responsive Design** - Play on desktop or mobile devices

## 🎯 How to Play

### Objective

Be the first player to get rid of all your cards by forming valid sets and placing them on the board!

### Turn Structure

Each turn consists of two phases:

| Phase         | Actions                                                                        |
| ------------- | ------------------------------------------------------------------------------ |
| **1. Draw**   | Draw one card from the main deck OR the throw pile (turn 4+)                   |
| **2. Action** | Place a valid set, add to existing sets, replace a joker, OR throw away a card |

### Valid Sets

#### Groups (Same Value)

- 3+ cards of the **same value**, **different suits**
- Example: 7♥ 7♠ 7♦
- Jokers allowed: 7♥ 7♠ 🃏

#### Sequences (Consecutive)

- 3+ **consecutive cards** of the **same suit**
- Example: 5♥ 6♥ 7♥
- Aces can be low (A-2-3) or high (Q-K-A)

### Joker Rules 🃏

- Jokers can substitute **any card** in a set
- From turn 4 onwards, you can **replace a joker** on the board with the matching card
- The replaced joker goes to your hand

## 🛠️ Tech Stack

| Technology             | Purpose                 |
| ---------------------- | ----------------------- |
| **React 19**           | UI Framework            |
| **TypeScript**         | Type Safety             |
| **Vite**               | Build Tool & Dev Server |
| **Firebase Firestore** | Real-time Database      |
| **Firebase Auth**      | Google Authentication   |
| **React Router**       | Client-side Routing     |
| **Sonner**             | Toast Notifications     |
| **React Confetti**     | Victory Animations      |

## 📁 Project Structure

```
joker-smash/
├── src/
│   ├── assets/Cards/       # Card images (all 54 cards)
│   ├── auth/               # Firebase configuration
│   ├── components/
│   │   └── game/           # Game UI components
│   │       ├── Game.tsx        # Main game logic
│   │       ├── CardRenderer.tsx
│   │       ├── DeckOfCards.tsx
│   │       ├── Hand.tsx
│   │       ├── ThrowPile.tsx
│   │       ├── InGameChat.tsx
│   │       └── WinModal.tsx
│   ├── data/               # Data models
│   │   ├── Card.ts         # Card class & types
│   │   └── Deck.ts         # Deck generation
│   ├── pages/              # Route pages
│   │   ├── HomePage.tsx
│   │   ├── CreateOnlineGame.tsx
│   │   ├── OnlineGame.tsx
│   │   ├── RoomList.tsx
│   │   └── InfoPage.tsx
│   ├── providers/          # React Context providers
│   ├── types/              # TypeScript definitions
│   └── utils/              # Game utilities & validation
├── public/
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project with Firestore & Authentication enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/joker-smash.git
   cd joker-smash
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Firebase**

   Create a Firebase project and update `src/auth/config.tsx` with your credentials:

   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     // ... other config
   };
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🎮 Game Configuration Options

When creating a new game, you can customize:

| Option              | Description               | Default |
| ------------------- | ------------------------- | ------- |
| **Room Name**       | Display name for the room | -       |
| **Player Limit**    | Maximum players (2-8)     | 2       |
| **Turn Timer**      | Seconds per turn phase    | 60      |
| **Number of Decks** | Card decks to use         | 2       |
| **Cards in Hand**   | Starting hand size        | 13      |
| **Password**        | Optional room password    | -       |

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Made with ❤️ and 🃏**

_Smash those jokers!_

</div>
