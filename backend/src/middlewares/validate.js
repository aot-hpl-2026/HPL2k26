import Joi from "joi";
import { ApiError } from "../utils/apiError.js";

// Generic validation middleware factory
export const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const message = error.details.map(d => d.message).join(", ");
      return next(new ApiError(message, 400));
    }

    // Replace with validated/sanitized value
    req[property] = value;
    next();
  };
};

// ============ AUTH SCHEMAS ============
export const authSchemas = {
  login: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required"
    }),
    password: Joi.string().min(6).max(100).required().messages({
      "string.min": "Password must be at least 6 characters",
      "any.required": "Password is required"
    })
  }),

  register: Joi.object({
    name: Joi.string().min(2).max(100).required().trim(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(100).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        "string.pattern.base": "Password must contain at least one uppercase, one lowercase, and one number"
      })
  })
};

// ============ TEAM SCHEMAS ============
export const teamSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required().trim(),
    shortName: Joi.string().min(2).max(10).required().trim().uppercase(),
    logo: Joi.string().uri().allow("", null),
    primaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default("#8B1538"),
    secondaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default("#FFD700"),
    hostel: Joi.string().max(100).allow("").trim(),
    description: Joi.string().max(500).allow("").trim(),
    motto: Joi.string().max(200).allow("").trim()
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).trim(),
    shortName: Joi.string().min(2).max(10).trim().uppercase(),
    logo: Joi.string().uri().allow("", null),
    primaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
    secondaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
    hostel: Joi.string().max(100).allow("").trim(),
    description: Joi.string().max(500).allow("").trim(),
    motto: Joi.string().max(200).allow("").trim(),
    captain: Joi.string().pattern(/^[a-f\d]{24}$/i)
  }),

  updateStats: Joi.object({
    matchesPlayed: Joi.number().integer().min(0),
    wins: Joi.number().integer().min(0),
    losses: Joi.number().integer().min(0),
    ties: Joi.number().integer().min(0),
    points: Joi.number().integer().min(0),
    nrr: Joi.number(),
    runsScored: Joi.number().integer().min(0),
    runsConceded: Joi.number().integer().min(0),
    oversPlayed: Joi.number().min(0),
    oversBowled: Joi.number().min(0)
  })
};

// ============ PLAYER SCHEMAS ============
export const playerSchemas = {
  create: Joi.object({
    teamId: Joi.string().pattern(/^[a-f\d]{24}$/i).required(),
    name: Joi.string().min(2).max(100).required().trim(),
    jerseyNumber: Joi.number().integer().min(0).max(99),
    role: Joi.string().valid("Batsman", "Bowler", "All-Rounder", "Wicket-Keeper").default("Batsman"),
    battingStyle: Joi.string().valid("Right-hand", "Left-hand").default("Right-hand"),
    bowlingStyle: Joi.string().max(50).allow("").default("None"),
    imageUrl: Joi.string().uri().allow("", null),
    isCaptain: Joi.boolean().default(false),
    isActive: Joi.boolean().default(true)
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).trim(),
    jerseyNumber: Joi.number().integer().min(0).max(99),
    role: Joi.string().valid("Batsman", "Bowler", "All-Rounder", "Wicket-Keeper"),
    battingStyle: Joi.string().valid("Right-hand", "Left-hand"),
    bowlingStyle: Joi.string().max(50).allow(""),
    imageUrl: Joi.string().uri().allow("", null),
    isCaptain: Joi.boolean(),
    isActive: Joi.boolean(),
    teamId: Joi.string().pattern(/^[a-f\d]{24}$/i)
  })
};

// ============ MATCH SCHEMAS ============
export const matchSchemas = {
  create: Joi.object({
    teamA: Joi.string().pattern(/^[a-f\d]{24}$/i).required(),
    teamB: Joi.string().pattern(/^[a-f\d]{24}$/i).required()
      .custom((value, helpers) => {
        if (value === helpers.state.ancestors[0].teamA) {
          return helpers.error("any.invalid");
        }
        return value;
      }).messages({ "any.invalid": "Team A and Team B must be different" }),
    venue: Joi.string().max(200).default("LPU Stadium").trim(),
    scheduledAt: Joi.date().iso().greater("now").required().messages({
      "date.greater": "Scheduled date must be in the future"
    }),
    overs: Joi.number().integer().min(1).max(50).default(6),
    matchNumber: Joi.number().integer().min(1)
  }),

  update: Joi.object({
    venue: Joi.string().max(200).trim(),
    scheduledAt: Joi.date().iso(),
    overs: Joi.number().integer().min(1).max(50),
    status: Joi.string().valid("scheduled", "live", "completed", "cancelled"),
    result: Joi.string().max(200).allow(""),
    winner: Joi.string().pattern(/^[a-f\d]{24}$/i).allow(null),
    toss: Joi.object({
      winner: Joi.string().pattern(/^[a-f\d]{24}$/i),
      decision: Joi.string().valid("bat", "bowl")
    })
  }),

  score: Joi.object({
    over: Joi.number().integer().min(0).required(),
    ball: Joi.number().integer().min(1).max(6).required(),
    battingTeam: Joi.string().pattern(/^[a-f\d]{24}$/i),
    bowlingTeam: Joi.string().pattern(/^[a-f\d]{24}$/i),
    striker: Joi.string().max(100).allow(""),
    nonStriker: Joi.string().max(100).allow(""),
    bowler: Joi.string().max(100).allow(""),
    strikerId: Joi.string().pattern(/^[a-f\d]{24}$/i).allow(null),
    nonStrikerId: Joi.string().pattern(/^[a-f\d]{24}$/i).allow(null),
    bowlerId: Joi.string().pattern(/^[a-f\d]{24}$/i).allow(null),
    runsOffBat: Joi.number().integer().min(0).max(6).default(0),
    extras: Joi.number().integer().min(0).max(7).default(0),
    extraType: Joi.string().valid("wide", "noball", "bye", "legbye", "penalty").allow("", null),
    wicket: Joi.boolean().default(false),
    dismissal: Joi.object({
      type: Joi.string().valid("bowled", "caught", "lbw", "runout", "stumped", "hitwicket", "obstructing"),
      fielder: Joi.string().max(100).allow("")
    }).allow(null)
  })
};

export default validate;
