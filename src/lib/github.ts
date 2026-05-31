export async function getContributions() {
  const username = "Judeadeniji";
  const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;

  if (!GITHUB_TOKEN) {
    console.warn("No GITHUB_TOKEN provided. Contributions may fail or be rate limited.");
  }

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${GITHUB_TOKEN}`,
      },
      body: JSON.stringify({
        query: `
          query {
            user(login: "${username}") {
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      contributionCount
                      date
                      color
                    }
                  }
                }
              }
            }
          }
        `,
      }),
    });

    const data = await response.json();
    const calendar = data?.data?.user?.contributionsCollection?.contributionCalendar;
    
    if (!calendar) return null;

    // Map GraphQL response to the format expected by the component
    return {
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks.map((week: any) => ({
        contributionDays: week.contributionDays.map((day: any) => {
          let intensity = 0;
          if (day.contributionCount > 0) intensity = 1;
          if (day.contributionCount > 4) intensity = 2;
          if (day.contributionCount > 8) intensity = 3;
          if (day.contributionCount > 12) intensity = 4;
          
          return {
            date: day.date,
            contributionCount: day.contributionCount,
            intensity
          };
        })
      }))
    };
  } catch (e) {
    console.error("Error fetching contributions:", e);
    return null;
  }
}
