export const getLast24HoursVolume = async (id?: string): Promise<any> => {
    try {
        const url = process.env.DIVERSIFI_URL + `/trading/r/last24HoursVolume`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        });
        return response.json();
    }
    catch (e) {
        console.error("Error getting volume data ", e);
        return undefined;
    }
};