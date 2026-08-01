import { WelcomeScreen } from '../src/screens/WelcomeScreen';
import { useRouter } from 'expo-router';

export default function IndexRoute() {
  const router = useRouter();
  
  return (
    <WelcomeScreen
      onNext={(mode) => {
        if (mode === 'presentation') {
          router.push('/setup');
        } else {
          router.push('/notes_setup');
        }
      }}
    />
  );
}
