import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Box, Flex, Text, Button, Heading, Input, Icon } from '@chakra-ui/react';
import { MdChevronLeft, MdAccessTime, MdCoffee, MdVolumeUp, MdFlashOn, MdNotifications, MdHourglassEmpty } from 'react-icons/md';
import { currentPageAtom, activeWorkoutAtom, appStateAtom, timeLeftAtom, currentRoundAtom, phaseAtom, totalTimeElapsedAtom, isRunningAtom, editingWorkoutIdAtom } from '../atoms';
import { WorkoutConfig, DEFAULT_WORKOUT } from '../types';
import { saveWorkout, generateId, setActiveWorkout, getAppState } from '../storage';
import DurationPicker from './DurationPicker';

export default function Settings() {
  const [, setCurrentPage] = useAtom(currentPageAtom);
  const [activeWorkout, setActiveWorkout_] = useAtom(activeWorkoutAtom);
  const [appState, setAppState] = useAtom(appStateAtom);
  const [, setTimeLeft] = useAtom(timeLeftAtom);
  const [, setCurrentRound] = useAtom(currentRoundAtom);
  const [, setPhase] = useAtom(phaseAtom);
  const [, setTotalTimeElapsed] = useAtom(totalTimeElapsedAtom);
  const [, setIsRunning] = useAtom(isRunningAtom);
  const [editingWorkoutId, setEditingWorkoutId] = useAtom(editingWorkoutIdAtom);
  
  const [workout, setWorkout] = useState<WorkoutConfig>({ ...activeWorkout });
  const [isNewWorkout, setIsNewWorkout] = useState(false);
  const [pickerOpen, setPickerOpen] = useState<'prep' | 'round' | 'rest' | null>(null);

  useEffect(() => {
    if (editingWorkoutId === 'new') {
      setIsNewWorkout(true);
      setWorkout({
        ...DEFAULT_WORKOUT,
        id: generateId(),
        name: '',
      });
    } else if (editingWorkoutId) {
      const existingWorkout = appState.workouts.find(w => w.id === editingWorkoutId);
      if (existingWorkout) {
        setWorkout({ ...existingWorkout });
        setIsNewWorkout(false);
      }
    } else {
      setWorkout({ ...activeWorkout });
      setIsNewWorkout(false);
    }
  }, [editingWorkoutId, activeWorkout, appState.workouts]);

  const handleSave = () => {
    const workoutToSave = {
      ...workout,
      name: workout.name || 'Unnamed Workout',
    };
    
    saveWorkout(workoutToSave);
    setActiveWorkout(workoutToSave.id);
    
    const freshState = getAppState();
    setAppState(freshState);
    
    setActiveWorkout_(workoutToSave);
    
    if (workoutToSave.preparationTime > 0) {
      setPhase('prep');
      setTimeLeft(workoutToSave.preparationTime);
    } else {
      setPhase('work');
      setTimeLeft(workoutToSave.roundDuration);
    }
    setCurrentRound(1);
    setTotalTimeElapsed(0);
    setIsRunning(false);
    
    setEditingWorkoutId(null);
    setCurrentPage('timer');
  };

  const handleBack = () => {
    setEditingWorkoutId(null);
    setCurrentPage('timer');
  };

  const updateWorkout = (updates: Partial<WorkoutConfig>) => {
    setWorkout(prev => ({ ...prev, ...updates }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box 
      bg="#0d1410" 
      minH="100vh" 
      color="white" 
      px={5} 
      pt="calc(env(safe-area-inset-top, 0px) + 8px)"
      pb="calc(env(safe-area-inset-bottom, 0px) + 24px)"
    >
      <Flex direction="column" gap={6} maxW="md" mx="auto">
        {/* Header */}
        <Flex align="center" py={5} gap={3}>
          <Button
            variant="ghost"
            color="white"
            onClick={handleBack}
            p={2}
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            <Icon as={MdChevronLeft} boxSize={6} />
          </Button>
          <Heading size="md" fontWeight="bold">
            {isNewWorkout ? 'New Workout' : 'Edit Workout'}
          </Heading>
        </Flex>

        {/* Workout Name */}
        <Box>
          <Text
            fontSize="xs"
            fontWeight="bold"
            letterSpacing="wider"
            textTransform="uppercase"
            color="#54f085"
            mb={3}
          >
            Workout Name
          </Text>
          <Input
            value={workout.name}
            onChange={(e) => updateWorkout({ name: e.target.value })}
            placeholder="e.g., Morning Sparring"
            variant="flushed"
            size="lg"
            borderColor="whiteAlpha.200"
            _focus={{ borderColor: '#54f085' }}
            _placeholder={{ color: 'whiteAlpha.400' }}
          />
        </Box>

        {/* Workout Parameters */}
        <Box>
          <Heading size="md" fontWeight="bold" mb={5}>
            Workout Parameters
          </Heading>

          {/* Prep Time */}
          <Button
            w="full"
            variant="ghost"
            display="flex"
            justifyContent="space-between"
            py={8}
            borderBottomWidth="1px"
            borderColor="whiteAlpha.100"
            onClick={() => setPickerOpen('prep')}
            _hover={{ bg: 'whiteAlpha.50' }}
          >
            <Flex align="center" gap={4}>
              <Box
                w={10}
                h={10}
                bg="rgba(250,204,21,0.15)"
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={MdHourglassEmpty} color="#facc15" boxSize={5} />
              </Box>
              <Box textAlign="left">
                <Text fontWeight="semibold">Prep Time</Text>
                <Text fontSize="xs" color="whiteAlpha.500">Countdown before start</Text>
              </Box>
            </Flex>
            <Text color="#facc15" fontWeight="bold" fontSize="lg">
              {workout.preparationTime === 0 ? 'Off' : `${workout.preparationTime}s`}
            </Text>
          </Button>

          {/* Round Duration */}
          <Button
            w="full"
            variant="ghost"
            display="flex"
            justifyContent="space-between"
            py={8}
            borderBottomWidth="1px"
            borderColor="whiteAlpha.100"
            onClick={() => setPickerOpen('round')}
            _hover={{ bg: 'whiteAlpha.50' }}
          >
            <Flex align="center" gap={4}>
              <Box
                w={10}
                h={10}
                bg="rgba(84,240,133,0.15)"
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={MdAccessTime} color="#54f085" boxSize={5} />
              </Box>
              <Box textAlign="left">
                <Text fontWeight="semibold">Round Duration</Text>
                <Text fontSize="xs" color="whiteAlpha.500">Standard training length</Text>
              </Box>
            </Flex>
            <Text color="#54f085" fontWeight="bold" fontSize="lg">
              {formatTime(workout.roundDuration)}
            </Text>
          </Button>

          {/* Rest Duration */}
          <Button
            w="full"
            variant="ghost"
            display="flex"
            justifyContent="space-between"
            py={8}
            borderBottomWidth="1px"
            borderColor="whiteAlpha.100"
            onClick={() => setPickerOpen('rest')}
            _hover={{ bg: 'whiteAlpha.50' }}
          >
            <Flex align="center" gap={4}>
              <Box
                w={10}
                h={10}
                bg="rgba(251,146,60,0.15)"
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={MdCoffee} color="#fb923c" boxSize={5} />
              </Box>
              <Text fontWeight="semibold">Rest Duration</Text>
            </Flex>
            <Text color="#fb923c" fontWeight="bold" fontSize="lg">
              {formatTime(workout.restDuration)}
            </Text>
          </Button>

          {/* Total Rounds */}
          <Box pt={6} pb={4}>
            <Flex justify="space-between" mb={3}>
              <Text fontSize="xs" fontWeight="bold" letterSpacing="wider" textTransform="uppercase" color="whiteAlpha.500">
                Total Rounds
              </Text>
              <Text fontSize="xs" fontWeight="bold" letterSpacing="wider" textTransform="uppercase" color="#54f085">
                Pro Setting
              </Text>
            </Flex>
            <Flex align="baseline" gap={2} mb={5}>
              <Text fontSize="4xl" fontWeight="black">{workout.totalRounds}</Text>
              <Text fontSize="md" color="whiteAlpha.500">rounds</Text>
            </Flex>
            <input
              type="range"
              value={workout.totalRounds}
              min={1}
              max={24}
              onChange={(e) => updateWorkout({ totalRounds: Number(e.target.value) })}
              style={{
                width: '100%',
                accentColor: '#54f085',
                height: '8px',
                borderRadius: '4px',
              }}
            />
            <Flex justify="space-between" mt={3}>
              {[1, 6, 12, 18, 24].map((mark) => (
                <Text key={mark} fontSize="xs" color="whiteAlpha.400">{mark}</Text>
              ))}
            </Flex>
          </Box>
        </Box>

        {/* Notifications & Feedback */}
        <Box>
          <Heading size="md" fontWeight="bold" mb={5}>
            Notifications & Feedback
          </Heading>

          <Flex direction="column" gap={1}>
            <Flex w="full" justify="space-between" align="center" py={3}>
              <Flex align="center" gap={4}>
                <Icon as={MdVolumeUp} color="whiteAlpha.600" boxSize={5} />
                <Text fontWeight="medium">Sound Effects</Text>
              </Flex>
              <input
                type="checkbox"
                checked={workout.soundEffects}
                onChange={() => updateWorkout({ soundEffects: !workout.soundEffects })}
                style={{ width: '20px', height: '20px', accentColor: '#54f085' }}
              />
            </Flex>

            <Flex w="full" justify="space-between" align="center" py={3}>
              <Flex align="center" gap={4}>
                <Icon as={MdFlashOn} color="whiteAlpha.600" boxSize={5} />
                <Text fontWeight="medium">Visual Flash</Text>
              </Flex>
              <input
                type="checkbox"
                checked={workout.visualFlash}
                onChange={() => updateWorkout({ visualFlash: !workout.visualFlash })}
                style={{ width: '20px', height: '20px', accentColor: '#54f085' }}
              />
            </Flex>
          </Flex>
        </Box>

        {/* Advanced */}
        <Box>
          <Heading size="md" fontWeight="bold" mb={5}>
            Advanced
          </Heading>

          <Button
            w="full"
            variant="ghost"
            display="flex"
            justifyContent="space-between"
            py={3}
            onClick={() => {
              const times = [10, 30, 60];
              const currentIndex = times.indexOf(workout.warningSignal);
              const nextIndex = (currentIndex + 1) % times.length;
              updateWorkout({ warningSignal: times[nextIndex] });
            }}
            _hover={{ bg: 'whiteAlpha.50' }}
          >
            <Flex align="center" gap={4}>
              <Icon as={MdNotifications} color="whiteAlpha.600" boxSize={5} />
              <Text fontWeight="medium">Warning Signal</Text>
            </Flex>
            <Text color="whiteAlpha.700" fontWeight="medium">
              {workout.warningSignal}s before end
            </Text>
          </Button>
        </Box>

        {/* Spacer */}
        <Box flex={1} minH={4} />

        {/* Save Button */}
        <Button
          w="full"
          size="lg"
          bg="#54f085"
          color="#0d1410"
          py={7}
          borderRadius="2xl"
          fontWeight="black"
          fontSize="sm"
          letterSpacing="widest"
          onClick={handleSave}
          _hover={{ bg: '#4de079' }}
          _active={{ transform: 'scale(0.98)' }}
          boxShadow="0 4px 20px rgba(84,240,133,0.3)"
        >
          {isNewWorkout ? 'Create Workout' : 'Save Changes'}
        </Button>
      </Flex>

      <DurationPicker
        isOpen={pickerOpen === 'prep'}
        onClose={() => setPickerOpen(null)}
        onSelect={(seconds) => updateWorkout({ preparationTime: seconds })}
        initialValue={workout.preparationTime}
        title="Prep Time"
        minMinutes={0}
        maxMinutes={1}
        showSeconds={true}
        accentColor="#facc15"
      />

      <DurationPicker
        isOpen={pickerOpen === 'round'}
        onClose={() => setPickerOpen(null)}
        onSelect={(seconds) => updateWorkout({ roundDuration: seconds })}
        initialValue={workout.roundDuration}
        title="Round Duration"
        minMinutes={0}
        maxMinutes={10}
        showSeconds={true}
        accentColor="#54f085"
      />

      <DurationPicker
        isOpen={pickerOpen === 'rest'}
        onClose={() => setPickerOpen(null)}
        onSelect={(seconds) => updateWorkout({ restDuration: seconds })}
        initialValue={workout.restDuration}
        title="Rest Duration"
        minMinutes={0}
        maxMinutes={5}
        showSeconds={true}
        accentColor="#fb923c"
      />
    </Box>
  );
}
