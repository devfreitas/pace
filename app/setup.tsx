import { SetupScreen } from '../src/screens/SetupScreen';
import { useRouter } from 'expo-router';

export default function SetupRoute() {
  const router = useRouter();

  return (
    <SetupScreen
      onStart={() => {
        router.push('/palco');
      }}
      onBack={() => {
        router.back();
      }}
    />
  );
}
