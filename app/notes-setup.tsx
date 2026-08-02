import { NotesSetupScreen } from '../src/screens/NotesSetupScreen';
import { useRouter } from 'expo-router';

export default function NotesSetupRoute() {
  const router = useRouter();

  return (
    <NotesSetupScreen
      onBack={() => {
        router.back();
      }}
    />
  );
}
