const { createApp } = Vue;

createApp({
    data() {
        return {
            hero: {
                name: "Ryu",
                life: 100,
                maxLife: 100,
                potions: 3,
                sprite: "images/nR5.gif",
                isDefending: false,
                attackPower: 1
            },
            villain: {
                name: "Dalhsim",
                life: 100,
                maxLife: 100,
                potions: 3,
                sprite: "images/hcC.gif",
                isDefending: false,
                attackPower: 1.1,
                criticalChance: 0.2
            },
            battleLog: [],
            gameOver: false,
            gameOverMessage: "",
            turn: 1
        };
    },
    methods: {
        performAction(action, isHero) {
            if (this.gameOver) return;

            const actor = isHero ? this.hero : this.villain;
            const target = isHero ? this.villain : this.hero;

            if (action === 'attack') {
                this.showVisualEffect('attack-effect');
            } else if (action === 'defend') {
                this.showVisualEffect('defense-effect');
            } else if (action === 'usePotion') {
                this.showVisualEffect('potion-effect');
            } else if (action === 'flee') {
                this.showVisualEffect('flee-effect');
            }

            switch (action) {
                case 'attack':
                    this.attack(actor, target);
                    break;
                case 'defend':
                    this.defend(actor);
                    break;
                case 'usePotion':
                    this.usePotion(actor);
                    break;
                case 'flee':
                    this.flee(actor);
                    break;
            }

            if (!this.gameOver && !isHero) {
                this.villainCounterAttack();
            } else if (!this.gameOver && isHero) {
                this.villainAction();
            }

            this.hero.isDefending = false;
            this.villain.isDefending = false;

            this.turn++;
            this.checkGameOver();
        },

        attack(attacker, defender) {
            let baseDamage = Math.floor(Math.random() * 15) + 10;
            let damage = Math.floor(baseDamage * attacker.attackPower);
            
            if (attacker === this.villain && Math.random() < this.villain.criticalChance) {
                damage *= 2;
                this.addToLog(`Ataque crítico do ${attacker.name}!`);
            }
            
            if (defender.isDefending) {
                damage = Math.floor(damage / 2);
                this.addToLog(`${defender.name} está defendendo e recebeu apenas metade do dano!`);
            }
            
            defender.life = Math.max(0, defender.life - damage);
            this.playSound('attack');
            this.addToLog(`${attacker.name} atacou ${defender.name} causando ${damage} de dano!`);
            this.shakeCharacter(defender === this.hero ? '.hero' : '.villain');
        },

        defend(character) {
            character.isDefending = true;
            const heal = Math.floor(Math.random() * 10) + 5;
            character.life = Math.min(character.maxLife, character.life + heal);
            this.playSound('defend');
            this.addToLog(`${character.name} está em posição de defesa e recuperou ${heal} de vida!`);
        },

        usePotion(character) {
            if (character.potions > 0) {
                const heal = Math.floor(character.maxLife * 0.3);
                character.life = Math.min(character.maxLife, character.life + heal);
                character.potions--;
                this.playSound('usePotion');
                this.addToLog(`${character.name} usou uma poção e recuperou ${heal} de vida!`);
            } else {
                this.addToLog(`${character.name} não tem mais poções!`);
            }
        },

        flee(character) {
            const success = Math.random() < 0.3;
            this.playSound('flee');
            if (success) {
                this.gameOver = true;
                this.gameOverMessage = `${character.name} fugiu com sucesso! O jogo acabou.`;
            } else {
                this.addToLog(`${character.name} tentou fugir, mas falhou!`);
            }
        },

        villainAction() {
            if (this.villain.life < this.villain.maxLife * 0.3 && this.villain.potions > 0) {
                this.usePotion(this.villain);
            } else if (this.villain.life < this.villain.maxLife * 0.5 && Math.random() < 0.4) {
                this.defend(this.villain);
            } else {
                this.attack(this.villain, this.hero);
            }
        },

        villainCounterAttack() {
            if (Math.random() < 0.4) {
                this.addToLog(`${this.villain.name} contra-ataca!`);
                this.attack(this.villain, this.hero);
            }
        },

        checkGameOver() {
            if (this.hero.life <= 0) {
                this.gameOver = true;
                this.gameOverMessage = "Game Over! O vilão venceu!";
            } else if (this.villain.life <= 0) {
                this.gameOver = true;
                this.gameOverMessage = "Parabéns! Você derrotou o vilão!";
            }
        },

        resetGame() {
            this.hero = {
                name: "Ryu",
                life: 100,
                maxLife: 100,
                potions: 3,
                sprite: "images/nR5.gif",
                isDefending: false,
                attackPower: 1
            };
            this.villain = {
                name: "Dalhsim",
                life: 100,
                maxLife: 100,
                potions: 3,
                sprite: "images/hcC.gif",
                isDefending: false,
                attackPower: 1.1,
                criticalChance: 0.2
            };
            this.battleLog = [];
            this.gameOver = false;
            this.gameOverMessage = "";
            this.turn = 1;
        },

        addToLog(message) {
            this.battleLog.unshift(`Turno ${this.turn}: ${message}`);
            if (this.battleLog.length > 5) {
                this.battleLog.pop();
            }
        },

        playSound(action) {
            const sound = document.createElement('audio');
            switch (action) {
                case 'attack':
                    sound.src = 'attack.mp3';
                    break;
                case 'defend':
                    sound.src = 'defend.mp3';
                    break;
                case 'usePotion':
                    sound.src = 'potion.mp3';
                    break;
                case 'flee':
                    sound.src = 'flee.mp3';
                    break;
            }
            sound.play();
        },

        showVisualEffect(effectClass) {
            const battleContainer = document.querySelector('.game-container');
            battleContainer.classList.add(effectClass);
            setTimeout(() => {
                battleContainer.classList.remove(effectClass);
            }, 1000); // O efeito visual dura 1 segundo
        },

        shakeCharacter(selector) {
            const element = document.querySelector(selector);
            element.classList.add('shake');
            setTimeout(() => {
                element.classList.remove('shake');
            }, 500); // A animação de shake dura 0.5 segundos
        }
    }
}).mount('#app');