const fs = require('fs');
const path = require('path');

const files = [
  'src/screens/WelcomeScreen.tsx',
  'src/screens/SetupScreen.tsx',
  'src/screens/PalcoScreen.tsx',
  'src/screens/NotesSetupScreen.tsx',
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // 1. Update import
  content = content.replace(/import \{ theme \} from '\.\.\/theme\/colors';/g, "import { useTheme, Theme } from '../theme/colors';");
  
  // 2. Inject useTheme and useMemo for styles
  content = content.replace(/(export function [a-zA-Z]+\(.*\) \{)/, "$1\n  const theme = useTheme();\n  const styles = React.useMemo(() => getStyles(theme), [theme]);");
  
  // 3. Update StyleSheet.create
  content = content.replace(/const styles = StyleSheet\.create\(\{/, "const getStyles = (theme: Theme) => StyleSheet.create({");
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated ' + file);
}

// Handle App.tsx (path is different)
let appContent = fs.readFileSync('App.tsx', 'utf8');
appContent = appContent.replace(/import \{ theme \} from '\.\/src\/theme\/colors';/g, "import { useTheme, Theme } from './src/theme/colors';");
appContent = appContent.replace(/(export default function App\(\) \{)/, "$1\n  const theme = useTheme();\n  const styles = React.useMemo(() => getStyles(theme), [theme]);");
appContent = appContent.replace(/const styles = StyleSheet\.create\(\{/, "const getStyles = (theme: Theme) => StyleSheet.create({");
fs.writeFileSync('App.tsx', appContent, 'utf8');
console.log('Updated App.tsx');

// Handle App.tsx internal StatusBar logic (since we just made it dynamic)
// Also we need to make sure we didn't inject useMemo if React is not imported.
