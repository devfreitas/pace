import { PalcoScreen } from '../src/screens/PalcoScreen';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store/useStore';

export default function PalcoRoute() {
  const router = useRouter();
  const blocks = useStore((state) => state.blocks);

  return (
    <PalcoScreen
      blocks={blocks}
      onEnd={() => {
        router.back();
      }}
    />
  );
}
