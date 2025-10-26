// Project data configuration file
// Used to manage data for the project display page

export interface Project {
	id: string;
	title: string;
	description: string;
	image: string;
	category: "web" | "mobile" | "desktop" | "other";
	techStack: string[];
	status: "completed" | "in-progress" | "planned";
	liveDemo?: string;
	sourceCode?: string;
	startDate: string;
	endDate?: string;
	featured?: boolean;
	tags?: string[];
	visitUrl?: string; // 添加前往项目链接字段
}

export const projectsData: Project[] = [
	{
		id: "hmcsm",
		title: "HMCSM",
		description:
			"hiruocha's Minecraft Server Manager",
		image: "",
		category: "other",
		techStack: ["POSIX Shell"],
		status: "planned",
		sourceCode: "https://github.com/hiruocha/hmcsm", // 更改为GitHub链接
		startDate: "2025-06-22",
	},
	{
		id: "craft_world",
		title: "Craft World",
		description:
			"Minecraft 原版增强数据包",
		image: "",
		category: "other",
		techStack: ["JSON"],
		status: "planned",
		sourceCode: "https://github.com/hiruocha/craft_wrold",
		startDate: "2025-06-02"
	},
	{
		id: "RedmiNote12TurboPatch",
		title: "Redmi Note 12 Turbo 增强模块",
		description: "增强系统功能，还你旗舰体验！",
		image: "",
		category: "other",
		techStack: ["Magisk Module"],
		status: "completed",
		sourceCode: "https://github.com/hiruocha/RedmiNote12TurboPatch",
		startDate: "2024-11-02",
		endDate: "2025-04-22",
	},
	{
		id: "Xiaomi13ProPatch",
		title: "Xiaomi 13 Pro 增强模块",
		description: "增强系统功能，还你旗舰体验！",
		image: "",
		category: "other",
		techStack: ["Magisk Module"],
		status: "completed",
		sourceCode: "https://github.com/hiruocha/Xiaomi13ProPatch",
		startDate: "2025-04-10",
		endDate: "2025-04-22",
	},
	{
		id: "HyperOSPatch",
		title: "HyperOSPatch",
		description: "增强系统功能，还你旗舰体验！",
		image: "",
		category: "other",
		techStack: ["Magisk Module", "POSIX Shell"],
		status: "in-progress",
		sourceCode: "https://github.com/hiruocha/HyperOSPatch",
		startDate: "2025-04-15",
		endDate: "2025-07-21",
	},
];

// Get project statistics
export const getProjectStats = () => {
	const total = projectsData.length;
	const completed = projectsData.filter((p) => p.status === "completed").length;
	const inProgress = projectsData.filter(
		(p) => p.status === "in-progress",
	).length;
	const planned = projectsData.filter((p) => p.status === "planned").length;

	return {
		total,
		byStatus: {
			completed,
			inProgress,
			planned,
		},
	};
};

// Get projects by category
export const getProjectsByCategory = (category?: string) => {
	if (!category || category === "all") {
		return projectsData;
	}
	return projectsData.filter((p) => p.category === category);
};

// Get featured projects
export const getFeaturedProjects = () => {
	return projectsData.filter((p) => p.featured);
};

// Get all tech stacks
export const getAllTechStack = () => {
	const techSet = new Set<string>();
	projectsData.forEach((project) => {
		project.techStack.forEach((tech) => {
			techSet.add(tech);
		});
	});
	return Array.from(techSet).sort();
};
