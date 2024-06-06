import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../services/socket";

export default function FightRoom() {
  const { roomId } = useParams();
  const [character, setCharacter] = useState<string | null>(null);
  const [players, setPlayers] = useState<{ id: string; character: string | null }[]>([]);
  const [countdown, setCountdown] = useState(0);
  const [start, setStart] = useState(false);
  const navigate = useNavigate();
  const [enemy, setEnemy] = useState<{ id: string; character: string | null } | null>(null);
  const [turn, setTurn] = useState<string | null>(null);
  const [enemyHealth, setEnemyHealth] = useState<number | null>(null);
  const [yourHealth, setYourHealth] = useState<number | null>(null);
  const [winner, setWinner] = useState<string | null>(null);

  const chooseCharacter = (character: string) => {
    setCharacter(character);
    socket.emit("character", { roomId, character });
  };

  useEffect(() => {
    socket.emit("join", roomId);

    socket.on("connect", () => {
      console.log("Connected to the server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from the server");
    });

    socket.on("players", (players: { id: string; character: string | null }[]) => {
      setPlayers(players);
      const enemyPlayer = players.find((player) => player.id !== socket.id);
      if (enemyPlayer) {
        setEnemy(enemyPlayer);
      }
    });

    socket.on("roomFull", () => {
      navigate("/");
    });

    socket.on("character", ({ id, character }) => {
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player.id === id ? { ...player, character } : player
        )
      );
    });

    socket.on("countdown", (countdown) => {
      setCountdown(countdown);
    });

    socket.on("start", (players) => {
      const enemyPlayer = players.find((player: { id: string; character: string | null }) => player.id !== socket.id);
      if (enemyPlayer) {
        setEnemy(enemyPlayer);
        setEnemyHealth(enemyPlayer.character ? enemyPlayer.character.health : null);
      }
      socket.emit("requestHealth", roomId); // Request initial health data
      setStart(true);
    });

    socket.on("characterChosen", (character) => {
      setCharacter(character);
      setYourHealth(character.health);
    });

    socket.on("enemyCharacterChosen", (character) => {
      setEnemy((prev) => (prev ? { ...prev, character } : null));
      setEnemyHealth(character.health);
    });

    socket.on("updateHealth", (data) => {
      if (data.id === socket.id) {
        setYourHealth(data.health);
      } else {
        setEnemyHealth(data.health);
      }
    });

    socket.on("initialHealth", (healthData) => {
      setYourHealth(healthData.yourHealth);
      setEnemyHealth(healthData.enemyHealth);
    });

    socket.on("turn", (playerId) => {
      setTurn(playerId);
    });

    socket.on("gameOver", (winnerId) => {
      setWinner(winnerId === socket.id ? "You" : "Enemy");
    });

    return () => {
      socket.emit("leave", roomId);
      socket.off("connect");
      socket.off("disconnect");
      socket.off("players");
      socket.off("roomFull");
      socket.off("character");
      socket.off("countdown");
      socket.off("start");
      socket.off("characterChosen");
      socket.off("enemyCharacterChosen");
      socket.off("updateHealth");
      socket.off("initialHealth");
      socket.off("turn");
      socket.off("gameOver");
    };
  }, [roomId, navigate]);

  useEffect(() => {
    if (players.length === 2 && players.every((player) => player.character)) {
      socket.emit("startCountdown", roomId);
    }
  }, [players, roomId]);

  useEffect(() => {
    if (yourHealth !== null && yourHealth <= 0) {
      socket.emit("gameOver", roomId, enemy?.id);
    } else if (enemyHealth !== null && enemyHealth <= 0) {
      socket.emit("gameOver", roomId, socket.id);
    }
  }, [yourHealth, enemyHealth, roomId, enemy?.id]);

  const attack = () => {
    if (turn === socket.id && enemy) {
      socket.emit("attack", roomId, enemy.id);
    }
  };

  const heal = () => {
    if (turn === socket.id) {
      socket.emit("heal", roomId);
    }
  };

  const specialMove = () => {
    if (turn === socket.id && enemy) {
      socket.emit("specialMove", roomId, enemy.id);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col justify-start items-center px-5 py-10 text-white">
      <h1 className="text-4xl text-center font-semibold text-primary">Room {roomId}</h1>
      {players.length < 2 ? (
        <div className="w-full h-full py-10 flex flex-col justify-center items-center gap-8">
          <h2 className="text-2xl text-center font-semibold text-secondary">
            Waiting for 2nd player
          </h2>
          <button onClick={() => navigate("/")} className="btn">
            Leave Room
          </button>
        </div>
      ) : (
        !character && (
          <div className="w-full h-full py-10 flex flex-col justify-center items-center gap-8">
            <h2 className="text-2xl text-center font-bold text-secondary">Choose your character</h2>
            <div className="flex justify-center items-center space-x-4">
              {["Warrior", "Mage", "Archer", "Healer"].map((char) => (
                <div key={char} className="flex flex-col items-center space-y-2">
                  <button
                    onClick={() => chooseCharacter(char)}
                    className="cursor-pointer aspect-square w-[200px] relative hover:scale-105 transform transition-transform duration-300"
                  >
                    <img
                      src={`/frame.png`}
                      alt="frame"
                      className="w-full h-full object-cover absolute top-0 left-0"
                    />
                    <img
                      src={`/${char.toLowerCase()}.jpg`}
                      alt={char}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <h3>{char}</h3>
                </div>
              ))}
            </div>
          </div>
        )
      )}
      {countdown > 0 && (
        <div className="w-full py-10 flex flex-col justify-start items-center">
          <h2>Starting in {countdown}...</h2>
        </div>
      )}
      <div className="w-full py-10 flex flex-col justify-start items-center">
        <h2>Players</h2>
        <ul className="flex justify-center items-center gap-4 w-full max-w-[500px] overflow-x-auto">
          {players.map(({ id, character }) => (
            <li key={id} className="flex gap-4">
              {character && (
                <div className="flex flex-col items-center space-x-2 mt-8">
                  <span>{id === socket.id ? "You" : "Your enemy"}</span>
                  <div className="aspect-square w-[200px] relative">
                    <img
                      src={`/frame.png`}
                      alt="frame"
                      className="w-full h-full object-cover absolute top-0 left-0"
                    />
                    {character && typeof character === 'string' ? (
                      <img
                        src={`/${character.toLowerCase()}.jpg`}
                        alt={character}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>No character</span>
                    )}
                  </div>
                </div>
              )}
              {!character && id !== socket.id && (
                <span className="w-full">Waiting for enemy to choose character...</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      {start && (
        <div className="w-full h-screen flex flex-col justify-start items-center px-5 py-10 text-white">
          {winner ? (
            <div className="w-full py-10 flex flex-col justify-center items-center">
              <h2 className="text-3xl text-center font-extrabold mb-8">{winner} Wins!</h2>
              <button onClick={() => navigate("/")} className="btn transform hover:scale-105 transition-transform duration-300">
                Leave Room
              </button>
            </div>
          ) : (
            character && enemy && (
              <div className="w-full py-10 flex flex-col justify-start items-center">
                <h2 className="text-2xl">Your Health: {yourHealth}</h2>
                <h2 className="text-2xl">Enemy Health: {enemyHealth}</h2>
                {turn === socket.id ? (
                  <div className="flex space-x-4">
                    <button onClick={attack} className="btn">
                      Attack
                    </button>
                    <button onClick={heal} className="btn">
                      Heal
                    </button>
                    <button onClick={specialMove} className="btn">
                      Special Move
                    </button>
                  </div>
                ) : (
                  <h2 className="text-3xl text-center font-light text-gray-300 mt-5">Waiting for enemy's move...</h2>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
