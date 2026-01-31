import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { Box, Flex, Text, Button, Heading, Grid, Icon } from "@chakra-ui/react";
import { FaPlay, FaPause, FaCheck } from "react-icons/fa";
import { MdRefresh, MdKeyboardArrowDown, MdEdit } from "react-icons/md";
import {
  currentRoundAtom,
  timeLeftAtom,
  isRunningAtom,
  phaseAtom,
  totalTimeElapsedAtom,
  currentPageAtom,
  activeWorkoutAtom,
  editingWorkoutIdAtom,
} from "./atoms";
import Settings from "./components/Settings";
import WorkoutSelector from "./components/WorkoutSelector";

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const audioContextRef = { current: null as AudioContext | null };

const getAudioContext = () => {
  if (!audioContextRef.current) {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContextRef.current;
};

const playBeep = (frequency: number, duration: number, volume: number = 0.5) => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.log("Audio not supported");
  }
};

const playWorkStartSound = () => {
  playBeep(880, 0.15, 0.6);
  setTimeout(() => playBeep(1100, 0.15, 0.6), 150);
  setTimeout(() => playBeep(1320, 0.2, 0.7), 300);
};

const playWorkEndSound = () => {
  playBeep(660, 0.3, 0.5);
  setTimeout(() => playBeep(440, 0.4, 0.5), 300);
};

function TimerPage() {
  const [activeWorkout] = useAtom(activeWorkoutAtom);
  const [currentRound, setCurrentRound] = useAtom(currentRoundAtom);
  const [timeLeft, setTimeLeft] = useAtom(timeLeftAtom);
  const [isRunning, setIsRunning] = useAtom(isRunningAtom);
  const [phase, setPhase] = useAtom(phaseAtom);
  const [totalTimeElapsed, setTotalTimeElapsed] = useAtom(totalTimeElapsedAtom);
  const [, setCurrentPage] = useAtom(currentPageAtom);
  const [, setEditingWorkoutId] = useAtom(editingWorkoutIdAtom);

  const timerRef = useRef<number | null>(null);

  const workTime = activeWorkout.roundDuration;
  const restTime = activeWorkout.restDuration;
  const prepTime = activeWorkout.preparationTime;
  const roundCount = activeWorkout.totalRounds;

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        if (phase !== "prep") {
          setTotalTimeElapsed((prev) => prev + 1);
        }
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (phase === "prep") {
              if (activeWorkout.soundEffects) playWorkStartSound();
              setPhase("work");
              return workTime;
            } else if (phase === "work") {
              if (activeWorkout.soundEffects) playWorkEndSound();
              if (currentRound >= roundCount) {
                setPhase("complete");
                setIsRunning(false);
                return 0;
              }
              setPhase("rest");
              return restTime;
            } else {
              if (activeWorkout.soundEffects) playWorkStartSound();
              setCurrentRound((prev) => prev + 1);
              setPhase("work");
              return workTime;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    isRunning,
    phase,
    currentRound,
    roundCount,
    workTime,
    restTime,
    prepTime,
    setTimeLeft,
    setPhase,
    setCurrentRound,
    setIsRunning,
    setTotalTimeElapsed,
  ]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentRound(1);
    if (prepTime > 0) {
      setPhase("prep");
      setTimeLeft(prepTime);
    } else {
      setPhase("work");
      setTimeLeft(workTime);
    }
    setTotalTimeElapsed(0);
  };

  const getProgress = () => {
    if (phase === "complete") return 100;
    if (phase === "prep") {
      return (1 - timeLeft / prepTime) * 100;
    } else if (phase === "work") {
      return (1 - timeLeft / workTime) * 100;
    } else {
      return (1 - timeLeft / restTime) * 100;
    }
  };

  const progress = getProgress();

  const getPhaseColor = () => {
    if (phase === "complete") return "#54f085";
    if (phase === "prep") return "#facc15";
    if (phase === "work") return "#54f085";
    return "#fb923c";
  };

  const getPhaseLabel = () => {
    if (phase === "complete") return "Workout Complete!";
    if (phase === "prep") return "Get Ready";
    if (phase === "work") return "Work Phase";
    return "Rest Phase";
  };

  const handleEditWorkout = () => {
    setEditingWorkoutId(activeWorkout.id);
    setCurrentPage("settings");
  };

  const circumference = 2 * Math.PI * 95;

  return (
    <Box
      bg="#0d1410"
      minH="100vh"
      color="white"
      maxW="480px"
      mx="auto"
      px={4}
      pt={2}
      pb={24}
    >
      <Flex direction="column" gap={4}>
        {/* Header */}
        <Box textAlign="center" py={4}>
          <Text
            fontSize="xs"
            fontWeight="black"
            letterSpacing="0.4em"
            textTransform="uppercase"
            color="whiteAlpha.800"
          >
            Boxing Timer
          </Text>
        </Box>

        {/* Round Info */}
        <Flex direction="column" align="center" gap={2}>
          <Heading size="lg" fontWeight="black">
            {phase === "complete" ? "Finished!" : phase === "prep" ? "Prepare" : `Round ${currentRound}/${roundCount}`}
          </Heading>
          <Text
            fontSize="xs"
            fontWeight="black"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color={getPhaseColor()}
          >
            {getPhaseLabel()}
          </Text>
          <Button
            size="sm"
            variant="outline"
            borderColor="whiteAlpha.200"
            bg="whiteAlpha.50"
            color="whiteAlpha.700"
            fontSize="xs"
            fontWeight="medium"
            letterSpacing="0.1em"
            textTransform="uppercase"
            onClick={() => setCurrentPage("workouts")}
            _hover={{ bg: "whiteAlpha.100" }}
          >
            {activeWorkout.name}
            <Icon as={MdKeyboardArrowDown} ml={1} />
          </Button>
        </Flex>

        {/* Main Timer Display */}
        <Box
          position="relative"
          w="full"
          maxW="340px"
          mx="auto"
          aspectRatio={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            as="svg"
            position="absolute"
            inset={0}
            w="full"
            h="full"
            transform="rotate(-90deg)"
            viewBox="0 0 200 200"
          >
            <circle
              cx="100"
              cy="100"
              r="95"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="2"
            />
            <circle
              cx="100"
              cy="100"
              r="95"
              fill="none"
              stroke={getPhaseColor()}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (progress / 100) * circumference}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 0.3s ease",
                filter:
                  phase === "complete"
                    ? "drop-shadow(0 0 15px rgba(84,240,133,0.6))"
                    : phase === "prep"
                    ? "drop-shadow(0 0 10px rgba(250,204,21,0.4))"
                    : phase === "work"
                    ? "drop-shadow(0 0 10px rgba(84,240,133,0.4))"
                    : "none",
              }}
            />
          </Box>

          {phase === "complete" ? (
            <Flex
              direction="column"
              align="center"
              gap={2}
              zIndex={1}
            >
              <Icon
                as={FaCheck}
                boxSize={{ base: 16, sm: 20 }}
                color="#54f085"
                filter="drop-shadow(0 0 30px rgba(84,240,133,0.8))"
              />
              <Text
                fontSize={{ base: "lg", sm: "xl" }}
                fontWeight="bold"
                color="#54f085"
                textTransform="uppercase"
                letterSpacing="0.2em"
              >
                Done
              </Text>
            </Flex>
          ) : (
            <Text
              fontSize={{ base: "7xl", sm: "9xl" }}
              fontWeight="black"
              letterSpacing="-0.08em"
              color={getPhaseColor()}
              textShadow={
                phase === "prep"
                  ? "0 0 40px rgba(250,204,21,0.7)"
                  : phase === "work"
                  ? "0 0 40px rgba(84,240,133,0.7)"
                  : "none"
              }
              zIndex={1}
            >
              {formatTime(timeLeft)}
            </Text>
          )}
        </Box>

        {/* Stats Grid */}
        <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={8}>
          <Box
            bg="#161e19"
            borderWidth="1px"
            borderColor="#1f2923"
            borderRadius="2xl"
            p={6}
            textAlign="center"
          >
            <Text
              fontSize="xs"
              fontWeight="black"
              letterSpacing="0.2em"
              textTransform="uppercase"
              color="whiteAlpha.300"
              mb={2}
            >
              Rest
            </Text>
            <Text fontSize="3xl" fontWeight="black" fontFamily="mono">
              {formatTime(restTime)}
            </Text>
          </Box>
          <Box
            bg="#161e19"
            borderWidth="1px"
            borderColor="#1f2923"
            borderRadius="2xl"
            p={6}
            textAlign="center"
          >
            <Text
              fontSize="xs"
              fontWeight="black"
              letterSpacing="0.2em"
              textTransform="uppercase"
              color="whiteAlpha.300"
              mb={2}
            >
              Total
            </Text>
            <Text fontSize="3xl" fontWeight="black" fontFamily="mono">
              {formatTime(totalTimeElapsed)}
            </Text>
          </Box>
        </Grid>

        {/* Controls */}
        <Flex direction="column" gap={4} mb={24}>
          <Button
            w="full"
            size="lg"
            bg="#54f085"
            color="#0d1410"
            py={7}
            borderRadius="2xl"
            fontWeight="black"
            fontSize="xl"
            letterSpacing="0.2em"
            onClick={toggleTimer}
            _hover={{ bg: "#4de079" }}
            _active={{ transform: "scale(0.98)" }}
            boxShadow="0 10px 30px rgba(84,240,133,0.3)"
          >
            <Flex align="center" gap={3}>
              {isRunning ? (
                <>
                  <Icon as={FaPause} boxSize={5} />
                  <Text>PAUSE</Text>
                </>
              ) : (
                <>
                  <Icon as={FaPlay} boxSize={5} />
                  <Text>START</Text>
                </>
              )}
            </Flex>
          </Button>

          <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
            <Button
              w="full"
              size="lg"
              variant="outline"
              borderWidth="2px"
              borderColor="#1f2923"
              color="white"
              py={7}
              borderRadius="2xl"
              fontWeight="black"
              fontSize="sm"
              letterSpacing="0.2em"
              onClick={handleEditWorkout}
              _hover={{ bg: "whiteAlpha.50" }}
            >
              <Flex align="center" gap={3}>
                <Icon as={MdEdit} boxSize={5} />
                <Text>EDIT</Text>
              </Flex>
            </Button>
            <Button
              w="full"
              size="lg"
              variant="outline"
              borderWidth="2px"
              borderColor="#1f2923"
              color="white"
              py={7}
              borderRadius="2xl"
              fontWeight="black"
              fontSize="sm"
              letterSpacing="0.2em"
              onClick={resetTimer}
              _hover={{ bg: "whiteAlpha.50" }}
            >
              <Flex align="center" gap={3}>
                <Icon as={MdRefresh} boxSize={5} />
                <Text>RESET</Text>
              </Flex>
            </Button>
          </Grid>
        </Flex>
      </Flex>
    </Box>
  );
}

export default function App() {
  const [currentPage] = useAtom(currentPageAtom);

  switch (currentPage) {
    case "settings":
      return <Settings />;
    case "workouts":
      return <WorkoutSelector />;
    default:
      return <TimerPage />;
  }
}
