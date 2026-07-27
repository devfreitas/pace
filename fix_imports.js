const fs = require('fs');
const files = [
  'src/screens/WelcomeScreen.tsx',
  'src/screens/SetupScreen.tsx',
  'src/screens/PalcoScreen.tsx',
  'src/screens/NotesSetupScreen.tsx',
  'App.tsx'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import \{ useTheme, Theme \} from '(\.\.?\/.+?theme\/colors)';/, "import { useTheme, Theme, theme } from '$1';");
  fs.writeFileSync(file, content, 'utf8');
}
