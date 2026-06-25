import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Matchmaker } from 'src/models/Matchmaker.model';
import { User } from 'src/models/User.model';
import { CreateMatchmakerDto } from 'src/dto/matchmaker.dto';

@Injectable()
export class MatchmakerService {
  constructor(
    @InjectModel(Matchmaker.name) private readonly MatchmakerModel: Model<Matchmaker>,
    @InjectModel(User.name) private readonly UserModel: Model<User>,
  ) {}

  async getMatchHistory(userId: string) {
    return this.MatchmakerModel.find({ user: userId }).sort({ createdAt: -1 });
  }

  async runMatchmaker(userId: string, data: CreateMatchmakerDto) {
    const { partner1, partner2 } = data;

    if (!partner1 || !partner2) {
      throw new BadRequestException('Preferences for both partners are required');
    }

    // 1. Calculate compatibility score
    let styleScore = 0;
    let budgetScore = 0;
    let focusScore = 0;
    let guestsScore = 0;

    const matches: string[] = [];
    const compromises: string[] = [];

    const styleFamilies = [
      ['Traditional', 'Royal'],
      ['Pastel', 'Modern'],
      ['Garden', 'Pastel'],
    ];
    const closeness = (a: string, b: string, groups: string[][]) =>
      groups.some((group) => group.includes(a) && group.includes(b));

    // Style
    if (partner1.style === partner2.style) {
      styleScore = 100;
      matches.push(`You both agree on a ${partner1.style} wedding theme!`);
    } else if (closeness(partner1.style, partner2.style, styleFamilies)) {
      styleScore = 70;
      matches.push(`${partner1.style} and ${partner2.style} can work together as a blended visual theme.`);
      compromises.push(
        `Use ${partner1.name}'s ${partner1.style} preference for the main event and ${partner2.name}'s ${partner2.style} preference for the photo corner or nikah stage.`,
      );
    } else {
      styleScore = 35;
      compromises.push(
        `${partner1.name} envisions a ${partner1.style} vibe, while ${partner2.name} prefers a ${partner2.style} style.`,
      );
    }

    // Budget
    if (partner1.budget === partner2.budget) {
      budgetScore = 100;
      matches.push(`You both agree on a ${partner1.budget} budget priority.`);
    } else {
      const budgetRank: Record<string, number> = { Essential: 1, Standard: 2, Medium: 2, Low: 1, Premium: 3, Luxury: 4 };
      const gap = Math.abs((budgetRank[partner1.budget] || 2) - (budgetRank[partner2.budget] || 2));
      budgetScore = gap === 1 ? 70 : gap === 2 ? 40 : 20;
      compromises.push(
        `${partner1.name} is planning for ${partner1.budget}, but ${partner2.name} prefers ${partner2.budget}. Lock a shared ceiling before booking venue and catering.`,
      );
    }

    // Focus
    if (partner1.focus === partner2.focus) {
      focusScore = 100;
      matches.push(`You both agree that the main highlight should be the ${partner1.focus}!`);
    } else {
      const focusFamilies = [
        ['Venue', 'Decor'],
        ['Food', 'Venue'],
        ['Photography', 'Decor'],
      ];
      focusScore = closeness(partner1.focus, partner2.focus, focusFamilies) ? 65 : 35;
      compromises.push(
        `${partner1.name} wants to focus on ${partner1.focus}, while ${partner2.name} prioritizes the ${partner2.focus}.`,
      );
    }

    // Guest Count
    if (partner1.guests === partner2.guests) {
      guestsScore = 100;
      matches.push(`You are in perfect agreement on a ${partner1.guests} guest list.`);
    } else {
      const g1 = partner1.guests.toLowerCase();
      const g2 = partner2.guests.toLowerCase();
      if (
        (g1.includes('intimate') && g2.includes('family')) ||
        (g1.includes('family') && g2.includes('intimate')) ||
        (g1.includes('family') && g2.includes('large')) ||
        (g1.includes('large') && g2.includes('family'))
      ) {
        guestsScore = 65;
      } else {
        guestsScore = 30;
      }
      compromises.push(
        `${partner1.name} prefers an ${partner1.guests} scale, but ${partner2.name} is looking at a ${partner2.guests} list.`,
      );
    }

    const compatibilityScore = Math.round(styleScore * 0.3 + budgetScore * 0.3 + focusScore * 0.25 + guestsScore * 0.15);

    // 2. Generate Recommendation
    let recommendation = '';
    if (compatibilityScore >= 80) {
      recommendation = `You are a strong planning match. Book the venue first, then reserve decor and photography around a ${partner1.style} direction, with ${partner1.focus} as the main priority and ${partner1.guests} as the working guest count.`;
    } else if (compatibilityScore >= 50) {
      recommendation = `You have a workable match with a few decisions to settle. Choose one shared budget ceiling, then split priorities: one partner leads ${partner1.focus}, the other leads ${partner2.focus}. A blended ${partner1.style}-${partner2.style} theme should keep both families comfortable.`;
    } else {
      recommendation = `Your choices are far apart, so decide the non-negotiables first: guest count, budget ceiling, and main event style. Consider a smaller nikah for one preference and a larger reception for the other, then book vendors only after those numbers are agreed.`;
    }

    // 3. Save to database
    const newMatch = await this.MatchmakerModel.create({
      user: userId,
      partner1,
      partner2,
      compatibilityScore,
      matches,
      compromises,
      recommendation,
    });

    return newMatch;
  }
}
