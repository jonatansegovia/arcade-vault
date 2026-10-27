'use client';
import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import {
  createAsteroidsGame,
  type AsteroidsCallbacks,
  type AsteroidsGame,
} from '@/src/games/asteroids/engine';
export type AsteroidsHandle = Pick<
  AsteroidsGame,
  'pause' | 'resume' | 'end' | 'restart'
>;
interface AsteroidsCanvasProps extends AsteroidsCallbacks {
  ref?: Ref<AsteroidsHandle>;
}
export default function AsteroidsCanvas({
  ref,
  onScore,
  onLives,
  onLevel,
  onGameOver,
}: AsteroidsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<AsteroidsGame | null>(null);
  // El motor se crea una sola vez; los callbacks se leen siempre de la última versión
  const callbacksRef = useRef<AsteroidsCallbacks>({
    onScore,
    onLives,
    onLevel,
    onGameOver,
  });
  useEffect(() => {
    callbacksRef.current = { onScore, onLives, onLevel, onGameOver };
  });
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const game = createAsteroidsGame(canvas, {
      onScore: (v) => callbacksRef.current.onScore(v),
      onLives: (v) => callbacksRef.current.onLives(v),
      onLevel: (v) => callbacksRef.current.onLevel(v),
      onGameOver: (v) => callbacksRef.current.onGameOver(v),
    });
    gameRef.current = game;
    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, []);
  useImperativeHandle(
    ref,
    () => ({
      pause: () => gameRef.current?.pause(),
      resume: () => gameRef.current?.resume(),
      end: () => gameRef.current?.end(),
      restart: () => gameRef.current?.restart(),
    }),
    [],
  );
  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
    />
  );
}
