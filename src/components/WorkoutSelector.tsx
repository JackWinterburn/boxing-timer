import { useAtom } from 'jotai';
import { Box, Flex, Text, Button, Heading, Icon } from '@chakra-ui/react';
import { MdChevronLeft, MdCheck, MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { currentPageAtom, activeWorkoutAtom, appStateAtom, timeLeftAtom, currentRoundAtom, phaseAtom, totalTimeElapsedAtom, isRunningAtom, editingWorkoutIdAtom } from '../atoms';
import { deleteWorkout, setActiveWorkout, saveAppState, getAppState } from '../storage';
import { WorkoutConfig } from '../types';

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function WorkoutSelector() {
  const [, setCurrentPage] = useAtom(currentPageAtom);
  const [activeWorkout, setActiveWorkout_] = useAtom(activeWorkoutAtom);
  const [appState, setAppState_] = useAtom(appStateAtom);
  const [, setTimeLeft] = useAtom(timeLeftAtom);
  const [, setCurrentRound] = useAtom(currentRoundAtom);
  const [, setPhase] = useAtom(phaseAtom);
  const [, setTotalTimeElapsed] = useAtom(totalTimeElapsedAtom);
  const [, setIsRunning] = useAtom(isRunningAtom);
  const [, setEditingWorkoutId] = useAtom(editingWorkoutIdAtom);

  const handleBack = () => {
    setCurrentPage('timer');
  };

  const handleSelectWorkout = (workout: WorkoutConfig) => {
    setActiveWorkout(workout.id);
    setActiveWorkout_(workout);
    
    const updatedState = { ...appState, activeWorkoutId: workout.id };
    setAppState_(updatedState);
    saveAppState(updatedState);
    
    if (workout.preparationTime > 0) {
      setPhase('prep');
      setTimeLeft(workout.preparationTime);
    } else {
      setPhase('work');
      setTimeLeft(workout.roundDuration);
    }
    setCurrentRound(1);
    setTotalTimeElapsed(0);
    setIsRunning(false);
    
    setCurrentPage('timer');
  };

  const handleEditWorkout = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWorkoutId(id);
    setCurrentPage('settings');
  };

  const handleDeleteWorkout = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === 'default') return;
    
    deleteWorkout(id);
    const newState = getAppState();
    setAppState_(newState);
    
    if (activeWorkout.id === id) {
      const defaultWorkout = newState.workouts.find(w => w.id === 'default') || newState.workouts[0];
      setActiveWorkout_(defaultWorkout);
      if (defaultWorkout.preparationTime > 0) {
        setPhase('prep');
        setTimeLeft(defaultWorkout.preparationTime);
      } else {
        setPhase('work');
        setTimeLeft(defaultWorkout.roundDuration);
      }
    }
  };

  const handleCreateNew = () => {
    setEditingWorkoutId('new');
    setCurrentPage('settings');
  };

  return (
    <Box bg="#0d1410" minH="100vh" color="white" overflowY="auto" p={4} pb={8}>
      <Flex direction="column" gap={6} maxW="md" mx="auto">
        {/* Header */}
        <Flex align="center" py={4} gap={4}>
          <Button
            variant="ghost"
            color="white"
            onClick={handleBack}
            p={2}
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            <Icon as={MdChevronLeft} boxSize={6} />
          </Button>
          <Text
            fontSize="sm"
            fontWeight="black"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color="whiteAlpha.800"
          >
            Select Workout
          </Text>
        </Flex>

        {/* Workout List */}
        <Flex direction="column" gap={3} flex={1}>
          {appState.workouts.map((workout) => (
            <Box
              key={workout.id}
              w="full"
              p={5}
              textAlign="left"
              borderRadius="20px"
              borderWidth="1px"
              borderColor={activeWorkout.id === workout.id ? '#54f085' : '#1f2923'}
              bg={activeWorkout.id === workout.id ? 'rgba(84,240,133,0.1)' : '#161e19'}
              onClick={() => handleSelectWorkout(workout)}
              cursor="pointer"
              _hover={{ borderColor: activeWorkout.id === workout.id ? '#54f085' : 'whiteAlpha.200' }}
              transition="all 0.2s"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSelectWorkout(workout)}
            >
              <Flex justify="space-between" align="center">
                <Box flex={1}>
                  <Flex align="center" gap={2} mb={2}>
                    <Heading size="sm" fontWeight="black">
                      {workout.name}
                    </Heading>
                    {activeWorkout.id === workout.id && (
                      <Icon as={MdCheck} color="#54f085" boxSize={4} />
                    )}
                  </Flex>
                  <Text fontSize="sm" color="whiteAlpha.500">
                    {workout.totalRounds} rounds • {formatDuration(workout.roundDuration)} work • {formatDuration(workout.restDuration)} rest
                    {workout.preparationTime > 0 && ` • ${workout.preparationTime}s prep`}
                  </Text>
                </Box>
                <Flex gap={1}>
                  <Box
                    as="span"
                    p={2}
                    borderRadius="md"
                    color="whiteAlpha.600"
                    cursor="pointer"
                    onClick={(e: React.MouseEvent) => handleEditWorkout(workout.id, e)}
                    _hover={{ bg: 'whiteAlpha.100' }}
                  >
                    <Icon as={MdEdit} boxSize={4} />
                  </Box>
                  {workout.id !== 'default' && (
                    <Box
                      as="span"
                      p={2}
                      borderRadius="md"
                      color="red.400"
                      cursor="pointer"
                      onClick={(e: React.MouseEvent) => handleDeleteWorkout(workout.id, e)}
                      _hover={{ bg: 'rgba(245,101,101,0.2)' }}
                    >
                      <Icon as={MdDelete} boxSize={4} />
                    </Box>
                  )}
                </Flex>
              </Flex>
            </Box>
          ))}
        </Flex>

        {/* Create New Button */}
        <Button
          w="full"
          size="lg"
          variant="outline"
          borderWidth="1px"
          borderColor="#1f2923"
          bg="#161e19"
          color="white"
          py={7}
          borderRadius="20px"
          fontWeight="black"
          fontSize="sm"
          letterSpacing="0.2em"
          onClick={handleCreateNew}
          _hover={{ bg: 'whiteAlpha.50' }}
        >
          <Icon as={MdAdd} mr={2} />
          Create New Workout
        </Button>
      </Flex>
    </Box>
  );
}
