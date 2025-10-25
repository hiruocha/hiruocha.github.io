// Skill data configuration file
// Used to manage data for the skill display page

export interface Skill {
	id: string;
	name: string;
	description: string;
	icon: string; // Iconify icon name
	category: "frontend" | "backend" | "database" | "tools" | "other";
	level: "beginner" | "intermediate" | "advanced" | "expert";
	experience: {
		years: number;
		months: number;
	};
	projects?: string[]; // Related project IDs
	certifications?: string[];
	color?: string; // Skill card theme color
}

export const skillsData: Skill[] = [
	// Frontend Skills
	{
		id: "markdown",
		name: "Markdown",
		description: "一种轻量级标记语言",
		icon: "mdi:markdown",
		category: "frontend",
		level: "beginner",
		experience: { years: 0, months: 0 }, // From 2025
		color: "#083FA1",
	},

	// Backend Skills

	// Database Skills
	{
		id: "json",
		name: "JSON",
		description: "一种轻量级资料交换格式",
		icon: "mdi:json",
		category: "database",
		level: "intermediate",
		experience: { years: 3, months: 0 }, // From 2022
		projects: ["craft_world"],
		color: "#292929",
	},

	// Tools
	{
		id: "git",
		name: "Git",
		description: "分布式版本控制软件",
		icon: "logos:git-icon",
		category: "tools",
		level: "beginner",
		experience: { years: 0, months: 0 }, // From 2025
		color: "#F05032",
	},
	{
		id: "neovim",
		name: "Neovim",
		description: "Vim的一个重构版本，致力于成为Vim的超集",
		icon: "simple-icons:neovim",
		category: "tools",
		level: "beginner",
		experience: { years: 0, months: 0 }, // From 2025
		color: "#4F9946",
	},

	// Other Skills
	{
		id: "posix-shell",
		name: "POSIX Shell",
		description: "符合国际《可移植操作系统接口》标准的 Shell",
		icon: "mdi:bash",
		category: "other",
		level: "beginner",
		experience: { years: 0, months: 0 }, // From 2025
		projects: ["hmcsm", "HyperOSPatch"],
		color: "#89E051",
	},
];

// Get skill statistics
export const getSkillStats = () => {
	const total = skillsData.length;
	const byLevel = {
		beginner: skillsData.filter((s) => s.level === "beginner").length,
		intermediate: skillsData.filter((s) => s.level === "intermediate").length,
		advanced: skillsData.filter((s) => s.level === "advanced").length,
		expert: skillsData.filter((s) => s.level === "expert").length,
	};
	const byCategory = {
		frontend: skillsData.filter((s) => s.category === "frontend").length,
		backend: skillsData.filter((s) => s.category === "backend").length,
		database: skillsData.filter((s) => s.category === "database").length,
		tools: skillsData.filter((s) => s.category === "tools").length,
		other: skillsData.filter((s) => s.category === "other").length,
	};

	return { total, byLevel, byCategory };
};

// Get skills by category
export const getSkillsByCategory = (category?: string) => {
	if (!category || category === "all") {
		return skillsData;
	}
	return skillsData.filter((s) => s.category === category);
};

// Get advanced skills
export const getAdvancedSkills = () => {
	return skillsData.filter(
		(s) => s.level === "advanced" || s.level === "expert",
	);
};

// Calculate total years of experience
export const getTotalExperience = () => {
	const totalMonths = skillsData.reduce((total, skill) => {
		return total + skill.experience.years * 12 + skill.experience.months;
	}, 0);
	return {
		years: Math.floor(totalMonths / 12),
		months: totalMonths % 12,
	};
};
