import { useState, useRef, useEffect } from 'react';
import { Box, Flex, Text, Button } from '@chakra-ui/react';

interface DurationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (seconds: number) => void;
  initialValue: number;
  title: string;
  minMinutes?: number;
  maxMinutes?: number;
  showSeconds?: boolean;
  accentColor?: string;
}

const ITEM_HEIGHT = 50;

function WheelColumn({
  values,
  selectedValue,
  onSelect,
  accentColor,
}: {
  values: number[];
  selectedValue: number;
  onSelect: (val: number) => void;
  accentColor: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  const selectedIndex = values.indexOf(selectedValue);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (containerRef.current) {
      const targetScroll = Math.max(0, selectedIndex) * ITEM_HEIGHT;
      if (isInitialMount.current) {
        containerRef.current.scrollTop = targetScroll;
        isInitialMount.current = false;
      } else {
        containerRef.current.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  const handleScroll = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const index = Math.round(scrollTop / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
        if (values[clampedIndex] !== selectedValue) {
          onSelect(values[clampedIndex]);
        }
      }
    }, 50);
  };

  return (
    <Box position="relative" w="100px" h={`${ITEM_HEIGHT * 3}px`}>
      <Box
        position="absolute"
        top={`${ITEM_HEIGHT}px`}
        left="4px"
        right="4px"
        h={`${ITEM_HEIGHT}px`}
        bg="rgba(84,240,133,0.15)"
        borderRadius="lg"
        border="2px solid"
        borderColor={accentColor}
        pointerEvents="none"
        zIndex={1}
      />
      <Box
        ref={containerRef}
        h="100%"
        overflowY="scroll"
        css={{
          scrollSnapType: 'y mandatory',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
        onScroll={handleScroll}
      >
        <Box h={`${ITEM_HEIGHT}px`} css={{ scrollSnapAlign: 'start' }} />
        {values.map((val, idx) => (
          <Flex
            key={idx}
            h={`${ITEM_HEIGHT}px`}
            align="center"
            justify="center"
            cursor="pointer"
            onClick={() => {
              onSelect(val);
              if (containerRef.current) {
                containerRef.current.scrollTo({
                  top: idx * ITEM_HEIGHT,
                  behavior: 'smooth',
                });
              }
            }}
            css={{ scrollSnapAlign: 'start' }}
          >
            <Text
              fontSize="2xl"
              fontWeight={val === selectedValue ? 'bold' : 'normal'}
              color={val === selectedValue ? accentColor : 'whiteAlpha.500'}
              transition="all 0.15s"
            >
              {val.toString().padStart(2, '0')}
            </Text>
          </Flex>
        ))}
        <Box h={`${ITEM_HEIGHT}px`} />
      </Box>
    </Box>
  );
}

export default function DurationPicker({
  isOpen,
  onClose,
  onSelect,
  initialValue,
  title,
  minMinutes = 0,
  maxMinutes = 10,
  showSeconds = true,
  accentColor = '#54f085',
}: DurationPickerProps) {
  const [minutes, setMinutes] = useState(Math.floor(initialValue / 60));
  const [seconds, setSeconds] = useState(initialValue % 60);

  useEffect(() => {
    setMinutes(Math.floor(initialValue / 60));
    setSeconds(initialValue % 60);
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  const minuteValues = Array.from(
    { length: maxMinutes - minMinutes + 1 },
    (_, i) => minMinutes + i
  );
  const secondValues = showSeconds
    ? [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
    : [0];

  const handleConfirm = () => {
    const totalSeconds = minutes * 60 + seconds;
    onSelect(totalSeconds);
    onClose();
  };

  return (
    <Box
      position="fixed"
      inset={0}
      bg="blackAlpha.800"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      onClick={onClose}
    >
      <Box
        bg="#161e19"
        borderRadius="2xl"
        p={6}
        minW="280px"
        border="1px solid"
        borderColor="#1f2923"
        onClick={(e) => e.stopPropagation()}
      >
        <Text
          fontSize="lg"
          fontWeight="bold"
          textAlign="center"
          mb={5}
          color="white"
        >
          {title}
        </Text>

        <Flex justify="center" align="center" gap={2} mb={6}>
          <WheelColumn
            values={minuteValues}
            selectedValue={minutes}
            onSelect={setMinutes}
            accentColor={accentColor}
          />
          {showSeconds && (
            <>
              <Text fontSize="3xl" fontWeight="bold" color={accentColor}>
                :
              </Text>
              <WheelColumn
                values={secondValues}
                selectedValue={seconds}
                onSelect={setSeconds}
                accentColor={accentColor}
              />
            </>
          )}
        </Flex>

        <Flex gap={3}>
          <Button
            flex={1}
            variant="ghost"
            color="whiteAlpha.700"
            borderRadius="xl"
            py={6}
            onClick={onClose}
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            Cancel
          </Button>
          <Button
            flex={1}
            bg={accentColor}
            color="#0d1410"
            borderRadius="xl"
            py={6}
            fontWeight="bold"
            onClick={handleConfirm}
            _hover={{ opacity: 0.9 }}
          >
            Confirm
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
