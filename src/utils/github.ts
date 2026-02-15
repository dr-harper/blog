interface ContributionDay {
  date: string;
  contributionCount: number;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface HeatmapData {
  weeks: ContributionWeek[];
  totalContributions: number;
}

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

export async function fetchGitHubContributions(
  username: string = 'dr-harper'
): Promise<HeatmapData | null> {
  const token = import.meta.env.GITHUB_TOKEN;

  if (!token) {
    console.warn('GITHUB_TOKEN not set — skipping GitHub heatmap');
    return null;
  }

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables: { username } }),
    });

    if (!response.ok) {
      console.error('GitHub API error:', response.statusText);
      return null;
    }

    const json = await response.json();
    const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;

    if (!calendar) return null;

    return {
      weeks: calendar.weeks,
      totalContributions: calendar.totalContributions,
    };
  } catch (error) {
    console.error('Failed to fetch GitHub contributions:', error);
    return null;
  }
}
