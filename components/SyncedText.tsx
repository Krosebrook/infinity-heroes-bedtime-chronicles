
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { memo } from 'react';
import { motion } from 'framer-motion';

interface SyncedTextProps {
    text: string;
    isActive: boolean;
    currentTime: number;
    duration: number;
}

export const SyncedText = memo(({ text, isActive, currentTime, duration }: SyncedTextProps) => {
    // Basic heuristics: 
    // - Split into sentences for broader highlighting
    // - Split into words for precise highlighting
    
    // Split sentences by punctuation, keeping the delimiter
    const sentenceMatches = text.match(/[^.!?]+[.!?]+[\])'"]*|[^.!?]+$/g) || [text];
    
    const totalChars = text.length;

    if (!isActive || duration <= 0) {
        return <p className="leading-relaxed font-serif text-gray-800">{text}</p>;
    }

    // Pre-compute character offsets for each sentence to avoid mutable accumulator in render
    const sentenceData = sentenceMatches.reduce<Array<{
        sentence: string;
        startChar: number;
        endChar: number;
    }>>((acc, sentence) => {
        const prev = acc[acc.length - 1];
        const startChar = prev ? prev.endChar : 0;
        return [...acc, { sentence, startChar, endChar: startChar + sentence.length }];
    }, []);

    return (
        <p className="leading-relaxed font-serif text-gray-800">
            {sentenceData.map(({ sentence, startChar, endChar }, sIdx) => {
                const sentStartTime = (startChar / totalChars) * duration;
                const sentEndTime = (endChar / totalChars) * duration;
                
                const isSentenceActive = currentTime >= sentStartTime && currentTime < sentEndTime;
                
                // Words within the sentence
                const words = sentence.split(/(\s+)/);

                const wordData = words.reduce<Array<{
                    word: string;
                    wIdx: number;
                    absStartChar: number;
                }>>((acc, word, wIdx) => {
                    const prev = acc[acc.length - 1];
                    const absStartChar = prev ? prev.absStartChar + prev.word.length : startChar;
                    return [...acc, { word, wIdx, absStartChar }];
                }, []);

                const sentenceElem = (
                    <span 
                        key={sIdx} 
                        className={`transition-colors duration-500 ${isSentenceActive ? 'bg-yellow-100/30 rounded px-1 -mx-1' : ''}`}
                    >
                        {wordData.map(({ word, wIdx, absStartChar }) => {
                            const wordLength = word.length;
                            const wordStartTime = (absStartChar / totalChars) * duration;
                            const wordEndTime = ((absStartChar + wordLength) / totalChars) * duration;
                            
                            const isWordActive = currentTime >= wordStartTime && currentTime < wordEndTime;

                            return (
                                <motion.span 
                                    key={`${sIdx}-${wIdx}-${word}`} 
                                    initial={false}
                                    animate={{ 
                                        color: isWordActive ? '#2563eb' : (isSentenceActive ? '#1e3a8a' : '#1f2937'),
                                        scale: isWordActive ? 1.05 : 1,
                                        textShadow: isWordActive ? "0px 0px 8px rgba(37,99,235,0.2)" : "none",
                                        opacity: isSentenceActive || !isActive ? 1 : 0.7
                                    }}
                                    transition={{ duration: 0.1 }}
                                    className={`inline-block whitespace-pre ${isWordActive ? 'font-bold relative z-10' : ''}`}
                                >
                                    {word}
                                </motion.span>
                            );
                        })}
                    </span>
                );

                return sentenceElem;
            })}
        </p>
    );
});
